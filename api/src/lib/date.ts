function utc() {
  return Date.now();
}

function minute(minutes: number) {
  return Date.now() + minutes * (60 * 1000);
}

function hour(hours: number) {
  return Date.now() + hours * (60 * 60 * 1000);
}

function day(days: number) {
  return Date.now() + days * (60 * 60 * 24 * 1000);
}

export const date = {
  utc,
  minute,
  hour,
  day,
}
