import type { Knex } from "knex";

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "postgresql",
    connection: {
      host: process.env.POSTGRES_HOST || "id_postgres",
      port: (process.env.PGPORT && parseInt(process.env.PGPORT)) || 7000,
      database: process.env.POSTGRES_DB || "id",
      user: process.env.POSTGRES_USER || "postgres",
      password: process.env.POSTGRES_PASSWORD || "postgres",
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },

  //test: {
  //  client: "postgresql",
  //  connection: {
  //    host: "id_postgres",
  //    port: 5432,
  //    database: "test",
  //    user: "postgres",
  //    password: "postgres",
  //  },
  //  pool: {
  //    min: 1,
  //    max: 1
  //  },
  //  migrations: {
  //    tableName: "knex_migrations"
  //  }
  //},

  //staging: {
  //  client: "postgresql",
  //  connection: {
  //    database: "my_db",
  //    user: "username",
  //    password: "password"
  //  },
  //  pool: {
  //    min: 2,
  //    max: 10
  //  },
  //  migrations: {
  //    tableName: "knex_migrations"
  //  }
  //},

  production: {
    client: "postgresql",
    connection: {
      host: process.env.POSTGRES_HOST || "id_postgres",
      port: (process.env.PGPORT && parseInt(process.env.PGPORT)) || 7000,
      database: process.env.POSTGRES_DB || "id",
      user: process.env.POSTGRES_USER || "postgres",
      password: process.env.POSTGRES_PASSWORD || "postgres",
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  }
};

module.exports = config;
