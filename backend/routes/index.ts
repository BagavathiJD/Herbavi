import { Router } from "express";
import authRoutes from "./auth.routes";
import measurementsRoutes from "./measurements.routes.js";
import productNamesRoutes from "./productNames.routes.js";
import productsRoutes from "./products.routes.js";
import ordersRoutes from "./orders.routes.js";
import customersRoutes from "./customers.routes.js";
import usersRoutes from "./users.routes.js";
import dbRoutes from "./db.routes.js";
import pincodeRoutes from "./pincode.routes.js";
import checkoutRoutes from "./checkout.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/measurements", measurementsRoutes);
router.use("/product-names", productNamesRoutes);
router.use("/products", productsRoutes);
router.use("/orders", ordersRoutes);
router.use("/customers", customersRoutes);
router.use("/users", usersRoutes);
router.use("/pincode", pincodeRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/", dbRoutes);

export default router;
