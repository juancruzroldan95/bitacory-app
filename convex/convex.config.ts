import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";
import rag from "@convex-dev/rag/convex.config.js";
import workpool from "@convex-dev/workpool/convex.config";

const app = defineApp();
app.use(agent);
app.use(rag);
app.use(workpool);

export default app;
