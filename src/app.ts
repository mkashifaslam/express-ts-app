import cookieParser from 'cookie-parser';
import type { Express } from 'express';
import express from 'express';

import { apiV1Router } from './routes.js';

export function buildApp(): Express {
  const app = express();

  // Middleware for JSON parsing.
  app.use(express.json());
  app.use(cookieParser());

  // Group routes under /api/v1.
  app.use('/api/v1', apiV1Router);

  return app;
}
