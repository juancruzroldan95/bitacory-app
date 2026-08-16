import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Ejecutar cada hora para chequear si algún usuario necesita un resumen pre-sesión o post-sesión.
crons.hourly(
  "check-therapy-schedules",
  { minuteUTC: 0 },
  internal.functions.crons.checkTherapySchedules
);

export default crons;
