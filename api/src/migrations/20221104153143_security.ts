import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("email_verify_login", (table) => {
      table.bigint("id").primary()
      table.bigint("user_id")
      table.binary("selector", 32).unique()
      table.binary("validator", 32)
      table.bigint("issued_at")
      table.bigint("sent_at")
      table.bigint("expires_at")
      table.boolean("verified")
      table.specificType("ip", "inet")
    })

    .createTable("email_verify_signup", (table) => {
      table.bigint("id").primary()
      table.string("username", 16)
      table.string("email", 320)
      table.binary("selector", 32).unique()
      table.binary("validator", 32)
      table.bigint("issued_at")
      table.bigint("sent_at")
      table.bigint("expires_at")
      table.boolean("verified")
    })

    .createTable("email_confirm_email", (table) => {
      table.bigint("id").primary()
      table.bigint("user_id")
      table.string("email", 320)
      table.binary("selector", 32).unique()
      table.binary("validator", 32)
      table.bigint("issued_at")
      table.bigint("sent_at")
      table.bigint("expires_at")
    })

    .createTable("email_revert_email", (table) => {
      table.bigint("id").primary()
      table.bigint("user_id")
      table.string("email", 320)
      table.binary("selector", 32).unique()
      table.binary("validator", 32)
      table.bigint("issued_at")
      table.bigint("sent_at")
      table.bigint("expires_at")
    })

    .createTable("email_change_password", (table) => {
      table.bigint("id").primary()
      table.bigint("user_id")
      table.binary("selector", 32).unique()
      table.binary("validator", 32)
      table.bigint("issued_at")
      table.bigint("sent_at")
      table.bigint("expires_at")
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable("email_verify_login")

    .dropTable("email_verify_signup")

    .dropTable("email_confirm_email")
    .dropTable("email_revert_email")

    .dropTable("email_change_password")
}
