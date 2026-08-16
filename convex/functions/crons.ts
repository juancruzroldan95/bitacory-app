import { internalAction, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const PRE_SESSION_PROMPT = `Sos Bitacory, un asistente de acompañamiento terapéutico.
El usuario tiene sesión de terapia mañana. Generá el cuerpo de una nota Markdown para que el usuario la use como plantilla para prepararse.
Debe ser breve (máximo 150 palabras), con tono cálido, empático y en español argentino (usando vos).
Incluí viñetas con preguntas disparadoras o espacios para que el usuario complete de qué quiere hablar. No pongas título principal (ya lo pone el sistema).`;

const POST_SESSION_PROMPT = `Sos Bitacory, un asistente de acompañamiento terapéutico.
El usuario terminó su sesión de terapia hace un rato. Generá el cuerpo de una nota Markdown para que el usuario la use como plantilla para reflexionar o "bajar" lo que habló.
Debe ser breve (máximo 150 palabras), con tono cálido, empático y en español argentino (usando vos).
Incluí viñetas con preguntas disparadoras o espacios para que anote aprendizajes o tareas. No pongas título principal (ya lo pone el sistema).`;

export const getAllSchedules = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Para simplificar, traemos todos los perfiles que tengan therapySchedule.
    // Convex no soporta query de "is not undefined", así que traemos todo y filtramos (asumiendo que no son miles en el MVP).
    const profiles = await ctx.db.query("profiles").take(1000);
    return profiles.filter((p) => p.therapySchedule !== undefined);
  },
});

export const checkTherapySchedules = internalAction({
  args: {},
  handler: async (ctx) => {
    const profilesToProcess = await ctx.runQuery(internal.functions.crons.getAllSchedules);

    const now = new Date();
    const currentUTCDay = now.getUTCDay(); // 0-6
    const currentUTCHour = now.getUTCHours(); // 0-23

    for (const profile of profilesToProcess) {
      if (!profile.therapySchedule) continue;

      const schedule = profile.therapySchedule;
      const [scheduleHourStr] = schedule.timeOfDay.split(":");
      const scheduleHour = parseInt(scheduleHourStr, 10);
      const scheduleDay = schedule.dayOfWeek;

      // PRE-SESION: 24hs antes
      const preSessionDay = scheduleDay === 0 ? 6 : scheduleDay - 1;
      
      if (
        schedule.notifyPreSession &&
        currentUTCDay === preSessionDay &&
        currentUTCHour === scheduleHour
      ) {
        await ctx.runAction(internal.functions.crons.generatePreSessionNote, {
          userId: profile.userId,
        });
      }

      // POST-SESION: 2hs después
      const postSessionHour = (scheduleHour + 2) % 24;
      let postSessionDay = scheduleDay;
      if (scheduleHour + 2 >= 24) {
        postSessionDay = (scheduleDay + 1) % 7;
      }

      if (
        schedule.notifyPostSession &&
        currentUTCDay === postSessionDay &&
        currentUTCHour === postSessionHour
      ) {
        await ctx.runAction(internal.functions.crons.generatePostSessionNote, {
          userId: profile.userId,
        });
      }
    }
  },
});

export const generatePreSessionNote = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const { text } = await generateText({
      model: openai.chat("gpt-4o-mini"),
      system: PRE_SESSION_PROMPT,
      prompt: "Generá la plantilla para el usuario.",
    });

    await ctx.runMutation(internal.functions.notes.internalCreate, {
      userId,
      title: "Preparación para la Sesión",
      body: text,
      tags: ["Terapia", "Preparación"],
    });
  },
});

export const generatePostSessionNote = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const { text } = await generateText({
      model: openai.chat("gpt-4o-mini"),
      system: POST_SESSION_PROMPT,
      prompt: "Generá la plantilla para el usuario.",
    });

    await ctx.runMutation(internal.functions.notes.internalCreate, {
      userId,
      title: "Reflexión Post-Sesión",
      body: text,
      tags: ["Terapia", "Reflexión"],
    });
  },
});
