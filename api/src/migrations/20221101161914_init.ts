import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("users", (table) => {
      table.bigint("id").primary()
      table.string("name", 64)
      table.string("username", 16).unique()
      table.bigint("joined_at")
      table.bigint("follower_count")
      table.bigint("following_count")
    })
    .createTable("user_follows", (table) => {
      table.bigint("id").primary()
      table.bigint("follower_id")
      table.bigint("following_id")
      table.unique(["follower_id", "following_id"])
    })

    .createTable("discussions", (table) => {
      table.bigint("id").primary()
      table.bigint("user_id")
      table.bigint("date")
      table.string("title", 100)
      table.string("readme", 100000)
      table.bigint("favourite_count")
      table.bigint("argument_count")
      table.bigint("comment_count")
      table.bigint("last_update_date")
      table.bigint("last_argument_date")
      table.bigint("last_comment_date")
    })
    .createTable("discussion_comments", (table) => {
      table.bigint("id").primary()
      table.bigint("user_id")
      table.bigint("discussion_id")
      table.bigint("date")
      table.string("content", 500)
    })
    .createTable("discussion_arguments", (table) => {
      table.bigint("id").primary()
      table.bigint("user_id")
      table.bigint("discussion_id")
      table.bigint("date")
      table.string("content", 500)
      table.boolean("type")
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
    .dropTable("user_follows")

    .dropTable("discussions")
    .dropTable("discussion_comments")
    .dropTable("discussion_arguments")
    .dropTable("argument_votes")
}
