import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("users", (table) => {
      table.boolean("has_notification").defaultTo(false).notNullable()
    })
    .createTable("user_notifications", (table) => {
      table.bigint("id").primary()
      table.bigint("target_id").notNullable()
      table.bigint("current_id").notNullable()
      table.bigint("entity_id").notNullable()
      table.smallint("type").notNullable()
      table.bigint("date")

      table.index("target_id", undefined, "hash")
      table.unique(["current_id", "entity_id"])
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("users", (table) => {
      table.dropColumn("has_notification")
    })
    .dropTable("user_notifications")
}