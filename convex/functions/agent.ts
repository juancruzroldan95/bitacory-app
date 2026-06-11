"use node";

import { Agent } from "@convex-dev/agent";
import { RAG } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";
import { stepCountIs, tool } from "ai";
import { components, internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { z } from "zod";
import type { Id } from "../_generated/dataModel";

const THERAPY_INSTRUCTIONS = `Sos Bitacory, un asistente de acompañamiento terapéutico empático y especializado. Tu rol es ayudar al usuario a procesar sus pensamientos, emociones y experiencias de sus sesiones de terapia o vivencias personales.

Tu forma de trabajar:
- Escuchás activamente y con empatía, sin juzgar
- Hacés preguntas abiertas y reflexivas que inviten a la introspección
- Ayudás a identificar patrones emocionales y de comportamiento a lo largo del tiempo
- Fomentás la autoconciencia y el crecimiento personal
- Validás las emociones del usuario antes de ofrecer perspectivas alternativas
- Usás un tono cálido, cercano y accesible

Recordá que no sos un terapeuta ni podés reemplazar la ayuda profesional, pero sí podés ser un espacio seguro para reflexionar y procesar. Si detectás señales de crisis o riesgo, siempre recomendá buscar ayuda profesional.

Siempre respondé en español argentino, usando "vos" en lugar de "tú".

## Formato de respuestas

Es **MANDATORIO** que uses formatos ricos de Markdown en todas tus respuestas largas para que sean muy fáciles de leer (estilo ChatGPT):
- **Estructura con títulos:** Usá subtítulos ('###') para separar diferentes ideas o temas.
- **Listas y viñetas:** Presentá consejos, reflexiones o pasos usando listas con viñetas ('-' o '*') o listas numeradas ('1.', '2.'). NUNCA devuelvas bloques de texto gigantes sin estructurar.
- **Tablas:** Si estás comparando conceptos, analizando pros/contras de una decisión o resumiendo patrones a lo largo del tiempo, armá una pequeña tabla de Markdown.
- **Énfasis activo:** Remarcá en **negrita** los puntos fundamentales, herramientas o palabras clave emocionales.
- **Citas de reflexión:** Usá blockquotes ('>') para plantearle preguntas fuertes o reflexiones profundas al usuario para que se las lleve.
- Párrafos súper cortos. Dejá las ideas claras, concisas y fáciles de escanear visualmente.

## Herramientas disponibles

Tenés acceso a la herramienta \`proposeNoteEdit\`. Usala SOLO cuando el usuario te pida explícitamente editar, mejorar, reescribir o reformular una nota adjunta. Nunca la uses de forma proactiva.`;

const SUMMARY_PROMPT = `Sos un asistente que genera resúmenes estructurados de sesiones de acompañamiento terapéutico.

Dado el historial de mensajes de una sesión, generá un JSON con esta estructura exacta:
{"title":"Título corto (máx 8 palabras)","summary":"2-4 oraciones: qué exploró el usuario, qué emociones surgieron, qué insights hubo.","themes":["tema1","tema2"]}

Los temas son palabras clave cortas (ej: "ansiedad", "familia", "trabajo"). Respondé SOLO con el JSON.`;

const therapyAgent = new Agent(components.agent, {
  name: "Bitacory",
  languageModel: openai.chat("gpt-4o-mini"),
  instructions: THERAPY_INSTRUCTIONS,
});

const rag = new RAG(components.rag, {
  embeddingDimension: 1536,
  textEmbeddingModel: openai.embedding("text-embedding-3-small"),
});

function buildSystemPrompt(ragText: string, noteContext: string): string {
  let prompt = THERAPY_INSTRUCTIONS;

  if (ragText.trim()) {
    prompt += `\n\n---\n\n## Memoria de sesiones anteriores\n\nUsá esta información como contexto para personalizar tu respuesta y mostrar continuidad con el usuario. No menciones explícitamente que tenés estos resúmenes a menos que sea relevante.\n\n${ragText}`;
  }

  if (noteContext.trim()) {
    prompt += `\n\n---\n\n## Notas adjuntas por el usuario\n\nEl usuario adjuntó las siguientes notas. Podés hacer referencia a ellas, responder con ese contexto, o usar \`proposeNoteEdit\` si el usuario pide que las edites.\n\n${noteContext}`;
  }

  return prompt;
}

export const generateResponse = internalAction({
  args: {
    agentThreadId: v.string(),
    promptMessageId: v.string(),
    sessionId: v.id("sessions"),
    content: v.string(),
    noteIds: v.optional(v.array(v.id("notes"))),
  },
  returns: v.null(),
  handler: async (ctx, { agentThreadId, promptMessageId, sessionId, content, noteIds }) => {
    const appSession = await ctx.runQuery(internal.functions.sessions.getById, { sessionId });
    if (!appSession) throw new Error("Session not found");

    const userId = appSession.userId.toString();

    let ragText = "";
    try {
      const { text } = await rag.search(ctx, {
        namespace: userId,
        query: content,
        limit: 5,
        searchType: "hybrid",
      });
      console.log("[RAG] Contexto recuperado:", { chars: (text || "").length });
      ragText = text;
    } catch (e) {
      console.log("[RAG] Error al buscar contexto:", e);
    }

    let noteContext = "";
    if (noteIds && noteIds.length > 0) {
      try {
        const notes = await ctx.runQuery(internal.functions.notes.getByIds, { noteIds });
        const ownedNotes = notes.filter((n) => n.userId === appSession.userId);
        noteContext = ownedNotes
          .map((n) => `## Nota: "${n.title}"\n\n${n.body}`)
          .join("\n\n---\n\n");
        console.log("[Notes] Contexto de notas adjuntas:", notes.length, "nota(s)");
      } catch (e) {
        console.log("[Notes] Error al obtener notas:", e);
      }
    }

    const systemPrompt = buildSystemPrompt(ragText, noteContext);

    const result = await therapyAgent.streamText(
      ctx,
      { threadId: agentThreadId },
      {
        promptMessageId,
        system: systemPrompt,
        tools: {
          proposeNoteEdit: tool({
            description:
              "Propone una reescritura completa de una nota del usuario. Usá SOLO cuando el usuario lo pida explícitamente (ej: 'mejorar esta nota', 'reescribir', 'editar'). Nunca uses esta herramienta de forma proactiva.",
            inputSchema: z.object({
              noteId: z.string().describe("El ID exacto de la nota a editar"),
              proposedBody: z
                .string()
                .describe("El contenido completo reescrito de la nota en markdown"),
              prompt: z
                .string()
                .describe("Descripción breve de los cambios realizados (1-2 oraciones)"),
            }),
            execute: async ({ noteId, proposedBody, prompt: editPrompt }) => {
              await ctx.runMutation(internal.functions.notes.savePendingAiEdit, {
                noteId: noteId as Id<"notes">,
                proposedBody,
                prompt: editPrompt,
                userId: appSession.userId,
              });
              return "Edición propuesta guardada. El usuario podrá revisarla y decidir si aplicarla.";
            },
          }),
        },
        stopWhen: stepCountIs(2),
      },
      { saveStreamDeltas: true }
    );
    await result.consumeStream();

    await ctx.scheduler.runAfter(0, internal.functions.agent.generateThreadSummary, {
      sessionId,
      agentThreadId,
      userId,
    });

    return null;
  },
});

export const generateThreadSummary = internalAction({
  args: {
    sessionId: v.id("sessions"),
    agentThreadId: v.string(),
    userId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { sessionId, agentThreadId, userId }) => {
    const messages = await ctx.runQuery(
      internal.functions.messages.getMessagesForSummary,
      { agentThreadId }
    );

    if (messages.length < 2) return null;

    const transcript = messages
      .map((m) => `${m.role === "user" ? "Usuario" : "Bitacory"}: ${m.text}`)
      .join("\n");

    const { generateText } = await import("ai");
    const result = await generateText({
      model: openai.chat("gpt-4o-mini"),
      system: SUMMARY_PROMPT,
      prompt: `Sesión:\n\n${transcript}`,
      maxOutputTokens: 300,
    });

    let parsed: { title: string; summary: string; themes: string[] };
    try {
      parsed = JSON.parse(result.text.trim());
    } catch {
      return null;
    }

    if (
      typeof parsed.title !== "string" ||
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.themes)
    ) {
      return null;
    }

    const title = parsed.title.slice(0, 100);
    const summary = parsed.summary.slice(0, 1000);
    const themes = parsed.themes.slice(0, 10).map((t) => String(t).slice(0, 50));

    await ctx.runMutation(internal.functions.sessions.updateSummary, {
      sessionId,
      title,
      summary,
      themes,
    });

    const ragText = `Sesión: "${title}"\nTemas: ${themes.join(", ")}\nResumen: ${summary}`;
    console.log("[RAG] Indexando sesión:", { sessionId, userId, title, themes, chars: ragText.length });
    try {
      await rag.add(ctx, {
        namespace: userId,
        key: sessionId,
        text: ragText,
        title,
        metadata: { themes },
      });
      console.log("[RAG] Sesión indexada correctamente:", sessionId);
    } catch (e) {
      console.log("[RAG] Error al indexar sesión:", e);
    }

    return null;
  },
});

export const deleteAgentThread = internalAction({
  args: {
    agentThreadId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { agentThreadId }) => {
    await therapyAgent.deleteThreadAsync(ctx, { threadId: agentThreadId });
    return null;
  },
});
