import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(express.json());

export const apiRouter = express.Router();
app.use("/api", apiRouter);

app.use(errorHandler);
