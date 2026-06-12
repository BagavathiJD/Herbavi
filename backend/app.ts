import express from "express";
import apiRoutes from "./routes/index";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRoutes);
app.use(errorHandler);

export default app;
