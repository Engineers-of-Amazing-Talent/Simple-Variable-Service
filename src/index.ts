import express, { Express } from 'express';
import repository from './model';
import useCollection from './router/middleware/useCollection';
import { variableRouter, listRouter } from './router';
import dotenv from 'dotenv';
dotenv.config();

const app: Express = express();
const {
  APP_PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_HOST,
  DB_PORT,
  POSTGRES_DB
} = process.env;

app.use(useCollection);
app.use(variableRouter);
app.use(listRouter);

repository.connect({
  url: `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${DB_PORT}/${POSTGRES_DB}`,
  options: {}
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
