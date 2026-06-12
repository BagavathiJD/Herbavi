import express from "express";
import apiRoutes from "./routes/index";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api", apiRoutes);
app.use(errorHandler);

export default app;
