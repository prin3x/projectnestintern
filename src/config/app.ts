export default {
  name: process.env.APP_NAME || 'TBS CMS API v2',
  version: process.env.APP_VERSION || '2.0.0',
  environment: process.env.NODE_ENV || 'development',
  port: process.env.APP_PORT || 4000,
  cors: process.env.APP_SECURITY_CORS === 'true',

  username: process.env.APP_USERNAME,
  password: process.env.APP_PASSWORD,
};
