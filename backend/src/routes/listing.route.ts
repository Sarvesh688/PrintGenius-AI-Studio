import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { createListingController, generateArtworkController, getListingBySlugController, getMockupBackController, getMockupUrlController, getUserListingsController } from "../controllers/listing.controller";


const listingRoutes = Router()
  // Public endpoints — back route must be registered before the generic front route
  .get("/mockup/:slug/:colorName/back", getMockupBackController)
  .get("/mockup/:slug/:colorName", getMockupUrlController)
  // Protected endpoints
  .get("/all", requireAuth, getUserListingsController)
  // Public endpoints (must come after specific routes)
  .get("/:slug", getListingBySlugController)
  .post("/generate-artwork", requireAuth, generateArtworkController)
  .post("/create", requireAuth, createListingController)

export default listingRoutes
