function readNumber(variable: string | undefined) {
  if (variable === undefined) return false;
  return parseInt(variable);
}

const postgresHost = process.env.POSTGRES_HOST || "forum_postgres";
const postgresPort = readNumber(process.env.PGPORT) || 7001;
const postgresName = process.env.POSTGRES_DB || "forum";
const postgresUser = process.env.POSTGRES_USER || "postgres";
const postgresPassword = process.env.POSTGRES_PASSWORD || "postgres";

const smtpHost = process.env.SMTP_HOST || "forum_mailslurper";
const smtpPort = readNumber(process.env.SMTP_PORT) || 2500;
const smtpUser = process.env.SMTP_USER || "";;
const smtpPassword = process.env.SMTP_PASSWORD || "";;

const bcryptRounds = readNumber(process.env.BCRYPT_ROUNDS) || 10;
const epochTime = readNumber(process.env.EPOCH_TIME) || 1672531200069;
const machineId = readNumber(process.env.MACHINE_ID) || 0;

const port = readNumber(process.env.PORT) || 8003;
const env: "development" | "production" = (
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production"
) && process.env.NODE_ENV || "development";

export const config = {
  postgresHost,
  postgresPort,
  postgresName,
  postgresUser,
  postgresPassword,

  smtpHost,
  smtpPort,
  smtpUser,
  smtpPassword,

  bcryptRounds,
  epochTime,
  machineId,

  port,
  env,
}