import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { getProductsController, getProductByIdController } from "../controllers/product.controller";


const productRoutes = Router()
  .get("/all", getProductsController)  // Public endpoint for browsing products
  .get("/:id", getProductByIdController)  // Public endpoint for viewing product details
  .use(requireAuth)  // Protected routes below

export default productRoutes
