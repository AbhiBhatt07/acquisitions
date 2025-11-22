import 'dotenv/config';

// Ensure your .env file has DATABASE_URL in the format: postgresql://user:password@host:port/database?sslmode=require

export default {
  schema: './src/models/*.js',
  out: './drizzle',
  dialect : 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  }
};