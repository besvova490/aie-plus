// types
import { TPrimitive } from "./TPrimitive";

export interface ISheet {
  "!ref"?: string;
  "!margins"?: Record<string, number>;
  "!merges"?: {
    s: { c: number; r: number };
    e: { c: number; r: number };
  }[];
  [key: string]: Record<string, TPrimitive>;
}
