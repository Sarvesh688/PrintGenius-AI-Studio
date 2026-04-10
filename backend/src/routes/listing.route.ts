import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { createListingController, generateArtworkController, getListingBySlugController, getMockupUrlController, getUserListingsController } from "../controllers/listing.controller";


const listingRoutes = Router()
  // Public endpoints
  .get("/mockup/:slug/:colorName", getMockupUrlController)
  // Protected endpoints
  .get("/all", requireAuth, getUserListingsController)
  // Public endpoints (must come after specific routes)
  .get("/:slug", getListingBySlugController)
  .post("/generate-artwork", requireAuth, generateArtworkController)
  .post("/create", requireAuth, createListingController)

export default listingRoutes
