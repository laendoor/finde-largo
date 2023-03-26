import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const name = process.env.npm_package_name;
const version = process.env.npm_package_version;
const port = Number.parseInt(process.env.PORT || "3000", 10);

app.get("/", (req: Request, res: Response) => {
  res.json("TBD");
});

app.get("/info", async (req, res) => {
  res.send(`${name}@${version}`);
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
