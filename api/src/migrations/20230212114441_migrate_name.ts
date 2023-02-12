import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("user_blocks", (table) => {
      table.bigint("id").primary()
      table.bigint("blocker_id")
      table.bigint("blocking_id")

      table.unique(["blocker_id", "blocking_id"])
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("user_blocks")
}