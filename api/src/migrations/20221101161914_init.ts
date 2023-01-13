import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("users", (table) => {
      table.bigint("id").primary()
      table.string("name", 64)
      table.string("username", 16).unique()
      table.bigint("joined_at")
    })
    .createTable("discussions", (table) => {
      table.bigint("id").primary()
      table.bigint("user_id")
      table.bigint("date")
      table.string("readme", 100000)
    })
    .createTable("comments", (table) => {
      table.bigint("id").primary()
      table.bigint("user_id")
      table.bigint("date")
      table.string("content", 500)
    })
    .createTable("arguments", (table) => {
      table.bigint("id").primary()
      table.bigint("user_id")
      table.boolean("type")
      table.bigint("date")
      table.string("content", 500)
      table.bigint("votes")
    })
    .createTable("argument_votes", (table) => {
      table.bigint("id").primary()
      table.bigint("user_id")
      table.bigint("argument_id")
      table.boolean("type")
      table.unique(["user_id", "argument_id"])
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable("users")
    .dropTable("discussions")
    .dropTable("comments")
    .dropTable("arguments")
    .dropTable("argument_votes")
}
