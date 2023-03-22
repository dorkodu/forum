import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("discussions", (table) => {
      table.dropColumn("last_argument_date")
      table.dropColumn("last_comment_date")
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("discussions", (table) => {
      table.bigint("last_argument_date")
      table.bigint("last_comment_date")
    })
}