declare global {
  namespace NodeJS {
    interface ProcessEnv {
      POSTGRES_HOST?: string;
      PGPORT?: string;
      POSTGRES_DB?: string;
      POSTGRES_USER?: string;
      POSTGRES_PASSWORD?: string;

      SMTP_HOST?: string;
      SMTP_PORT?: string;
      SMTP_USER?: string;
      SMTP_PASSWORD?: string;

      BCRYPT_ROUNDS?: string;
      EPOCH_TIME?: string;
      MACHINE_ID?: string;

      PORT?: string;
      NODE_ENV?: string;
      SERVICE_WHITELIST?: string;
    }
  }
}

export { }