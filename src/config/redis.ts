export default {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: process.env.REDIS_DB,
  password: process.env.REDIS_PASSWORD,

  defaultDuration: 3 * 60 * 60 * 1000,
};
