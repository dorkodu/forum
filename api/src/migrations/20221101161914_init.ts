import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("users", (table) => {
      table.bigint("id").primary()
      table.string("username", 16).unique()
      table.string("email", 320).unique()
      table.binary("password", 60)
      table.bigint("joined_at")
    })

    .createTable("sessions", (table) => {
      table.bigint("id").primary()
      table.bigint("user_id")
      table.binary("selector", 32).unique()
      table.binary("validator", 32)
      table.bigint("created_at")
      table.bigint("expires_at")
      table.string("user_agent", 256)
      table.specificType("ip", "inet")
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable("users")
    .dropTable("sessions")
}
