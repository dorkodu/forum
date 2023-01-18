import express from "express";
import cookieParser from "cookie-parser";

import { config } from "./config";

import { schema } from "./controllers/_schema";

async function main() {
  const app = express();

  app.set("trust proxy", true);
  app.disable('x-powered-by');
  app.use(express.json());
  app.use(cookieParser());

  app.use("/api", async (req, res, next) => {
    const shared = { triedAuth: undefined, userId: undefined };
    res.status(200).send(await schema.execute(() => ({ req, res, next, shared }), req.body));
  });

  app.listen(config.port, () => { console.log(`Server has started on port ${config.port}`) });
}

main();