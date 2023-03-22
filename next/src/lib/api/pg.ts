import postgres from 'postgres'
import { config } from './config'

const pg = postgres({
  host: config.postgresHost,
  port: config.postgresPort,
  user: config.postgresUser,
  password: config.postgresPassword,
  database: config.postgresName,
  transform: postgres.camel,
})

export default pg