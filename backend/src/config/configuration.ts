export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 4000),
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  ai: {
    openAiApiKey: process.env.OPENAI_API_KEY,
  },
  queue: {
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
  },
  storage: {
    gcsBucketName: process.env.GCS_BUCKET_NAME,
  },
});
