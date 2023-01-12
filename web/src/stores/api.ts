import type { Schema } from "../../../api/src/controllers/_schema";
import client from "@dorkodu/sage-client";

export const sage = client.use<Schema>();

export async function request(data: any) {
  const options: RequestInit = { method: "POST" }
  if (data !== undefined) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(data)
  }

  try {
    const res = await fetch("/api", options);
    const data = await res.json().catch(() => undefined);

    return data;
  } catch {
    return undefined;
  }
}