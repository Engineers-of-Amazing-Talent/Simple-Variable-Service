import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app: Express = express();
const { APP_PORT } = process.env;

// TODO: implement model / router / interfaces 

app.get('/', (req: Request, res: Response, next: NextFunction ) => {
  res.send('Variable Router Response');
});

app.listen(APP_PORT, () => {
  console.log('App is running - HTTP(S) :: ', APP_PORT);
});
