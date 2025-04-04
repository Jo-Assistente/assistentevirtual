import { Express } from "express";
import dotenv from "dotenv";
import { setupExpress } from "./expressConfig.js";
import { router } from "./router.js";
import cookieParser from "cookie-parser";
import { loadAndNormalizeDocuments } from "./documentLoader.js";
import express from 'express';

dotenv.config();

const app: Express = express();
const port: number = 9000;
app.use(cookieParser());

await loadAndNormalizeDocuments();

setupExpress(app);
app.use(router);

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
