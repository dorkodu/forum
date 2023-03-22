import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("argument_votes", table => {
      table.dropNullable("user_id")
      table.dropNullable("argument_id")
      table.dropNullable("discussion_id")
      table.dropNullable("type")
    })
    .alterTable("discussion_arguments", table => {
      table.dropNullable("user_id")
      table.dropNullable("discussion_id")
      table.dropNullable("date")
      table.dropNullable("type")
      table.dropNullable("vote_count")
    })
    .alterTable("discussion_comments", table => {
      table.dropNullable("user_id")
      table.dropNullable("discussion_id")
      table.dropNullable("date")
    })
    .alterTable("discussion_favourites", table => {
      table.dropNullable("user_id")
      table.dropNullable("discussion_id")
    })
    .alterTable("discussions", table => {
      table.dropNullable("user_id")
      table.dropNullable("date")
      table.dropNullable("favourite_count")
      table.dropNullable("argument_count")
      table.dropNullable("comment_count")
      table.dropNullable("last_update_date")
    })
    .alterTable("user_blocks", table => {
      table.dropNullable("blocker_id")
      table.dropNullable("blocking_id")
    })
    .alterTable("user_follows", table => {
      table.dropNullable("follower_id")
      table.dropNullable("following_id")
    })
    .alterTable("users", table => {
      table.dropNullable("join_date")
      table.dropNullable("follower_count")
      table.dropNullable("following_count")
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable("argument_votes", table => {
      table.setNullable("user_id")
      table.setNullable("argument_id")
      table.setNullable("discussion_id")
      table.setNullable("type")
    })
    .alterTable("discussion_arguments", table => {
      table.setNullable("user_id")
      table.setNullable("discussion_id")
      table.setNullable("date")
      table.setNullable("type")
      table.setNullable("vote_count")
    })
    .alterTable("discussion_comments", table => {
      table.setNullable("user_id")
      table.setNullable("discussion_id")
      table.setNullable("date")
    })
    .alterTable("discussion_favourites", table => {
      table.setNullable("user_id")
      table.setNullable("discussion_id")
    })
    .alterTable("discussions", table => {
      table.setNullable("user_id")
      table.setNullable("date")
      table.setNullable("favourite_count")
      table.setNullable("argument_count")
      table.setNullable("comment_count")
      table.setNullable("last_update_date")
    })
    .alterTable("user_blocks", table => {
      table.setNullable("blocker_id")
      table.setNullable("blocking_id")
    })
    .alterTable("user_follows", table => {
      table.setNullable("follower_id")
      table.setNullable("following_id")
    })
    .alterTable("users", table => {
      table.setNullable("join_date")
      table.setNullable("follower_count")
      table.setNullable("following_count")
    })
}