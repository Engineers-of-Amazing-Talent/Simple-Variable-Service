import express, { Express, Request, Response } from 'express';
import repository from './model';
import { v1Router, v2Router } from './router';
import dotenv from 'dotenv';
dotenv.config();

const app: Express = express();
const {
  NODE_ENV,
  APP_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_HOST,
  DB_PORT,
  POSTGRES_DB
} = process.env;

app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);
app.get('/status', (request: Request, response: Response) => {
  response.json({ status: 'OKAY' });
});

const dialectOptions = { ssl: { rejectUnauthorized: false, required: true } };

repository.connect({
  url: `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${DB_PORT}/${POSTGRES_DB}`,
  options: NODE_ENV === 'production' ? {dialectOptions} : {}
})
.then(() => repository.initialize())
.then(() => {
  app.listen(APP_PORT, () => {
    console.log('App is running - HTTP(S) :: ', APP_PORT);
  });
})
.catch(e => {
  console.error('Failed to initialize repository:', e);
});
