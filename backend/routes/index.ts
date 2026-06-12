import { Router } from "express";
import measurementsRoutes from "./measurements.routes.js";
import productNamesRoutes from "./productNames.routes.js";
import productsRoutes from "./products.routes.js";
import ordersRoutes from "./orders.routes.js";
import customersRoutes from "./customers.routes.js";
import dbRoutes from "./db.routes.js";

const router = Router();

router.use("/measurements", measurementsRoutes);
router.use("/product-names", productNamesRoutes);
router.use("/products", productsRoutes);
router.use("/orders", ordersRoutes);
router.use("/customers", customersRoutes);
router.use("/", dbRoutes);

export default router;
