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
      table.bigint("parent_id").notNullable()
      table.bigint("child_id").nullable()
      table.smallint("type").notNullable()
      table.bigint("date").notNullable()

      table.index("target_id", undefined, "hash")
    })
    .raw(`
      ALTER TABLE user_notifications
      ADD UNIQUE NULLS NOT DISTINCT (current_id, parent_id, child_id);
    `)
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("users", (table) => {
      table.dropColumn("has_notification")
    })
    .dropTable("user_notifications")
}