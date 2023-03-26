import express from 'express';
import dotenv from 'dotenv';
import apiRouter from './api-router';

dotenv.config();

const app = express();
const port = Number.parseInt(process.env.PORT || '3000', 10);

app.use('/api/v1', apiRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
