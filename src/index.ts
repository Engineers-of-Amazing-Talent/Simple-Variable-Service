import express, { Express, Request, Response, NextFunction } from 'express';
import repository from './model';
import { Collection } from './interface';
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

// configure the collection interface with the repository
const collection = new Collection(repository);

// TODO: implement model / router / interfaces 
app.use((request: Request, response: Response, next: NextFunction) => {
  request.collection = collection;
  next();
});

app.get('/', (req: Request, res: Response, next: NextFunction ) => {
  res.send('Variable Router Response');
});

repository.connect({
  url: `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${DB_PORT}/${POSTGRES_DB}`,
  options: {}
})
.then(repository.initialize)
.then(() => {
  app.listen(APP_PORT, () => {
    console.log('App is running - HTTP(S) :: ', APP_PORT);
  });
});
