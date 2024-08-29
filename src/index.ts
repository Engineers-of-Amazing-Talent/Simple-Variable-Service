import express, { Express } from 'express';
import repository from './model';
import { variableRouter, listRouter, useCollection, errorHandler } from './router';
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

app.use(useCollection);
app.use('/variable', variableRouter);
app.use('/listItem', listRouter);
app.use(errorHandler);

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
