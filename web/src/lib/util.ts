function parseUserAgent(ua: string) {
  return ua.split(",").filter(value => value !== "").join(" | ");
}

export const util = { parseUserAgent }