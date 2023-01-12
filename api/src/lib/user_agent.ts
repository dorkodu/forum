import { Request } from "express";
import { UAParser } from "ua-parser-js";

function get(req: Request) {
  return parse(req.headers["user-agent"]);
}

function parse(userAgent: string | undefined): string {
  if (!userAgent) return "";

  const { browser, cpu, device, engine, os } = new UAParser(userAgent).getResult();

  const tags = [
    device.vendor,
    device.model,
    os.name,
    os.version,
    cpu.architecture,
    browser.name,
    browser.version,
    engine.name,
    engine.version,
  ].join(",");

  return tags.slice(0, 256);
}

export const userAgent = {
  get,
}