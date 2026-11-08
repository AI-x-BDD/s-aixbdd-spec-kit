import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import { adminRouter } from "./routes/adminRouter.js";
import { authRouter } from "./routes/authRouter.js";
import { equipmentsRouter } from "./routes/equipmentsRouter.js";
import { reservationsRouter } from "./routes/reservationsRouter.js";

export const app = express();

app.use(express.json());

export const apiRouter = express.Router();
apiRouter.use("/auth", authRouter);
apiRouter.use("/equipments", equipmentsRouter);
apiRouter.use("/reservations", reservationsRouter);
apiRouter.use("/admin", adminRouter);
app.use("/api", apiRouter);

app.use(errorHandler);
