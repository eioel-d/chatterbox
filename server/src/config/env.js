import 'dotenv/config';

export const env = {
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  port: process.env.PORT || 5000,
};
