export default {
  secret: process.env.APP_JWT_SECRET,
  signOptions: {
    issuer: process.env.APP_JWT_ISS || '',
    audience: process.env.APP_JWT_AUD || '',
    expiresIn: process.env.APP_JWT_EXPIRES_IN
      ? Number(process.env.APP_JWT_EXPIRES_IN)
      : 28800,
  },
};
