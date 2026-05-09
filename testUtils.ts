/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import schema from "./convex/schema";

export const modules = import.meta.glob("./convex/**/*.*s");

export function makeT() {
  return convexTest(schema, modules);
}
