import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { createListingSchema, generateArtworkSchema, GetMockupUrlSchema, slugSchema } from "../validators/listing.validator";
import { HTTPSTATUS } from "../config/http.config";
import { createListingService, generateArtworkService, getListingBySlugService, getMockupImageService, getUserListingsService } from "../services/listing.service";


export const createListingController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const body = createListingSchema.parse(req.body);
    const data = await createListingService(userId, body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Listing created successfully",
      ...data
    })
  }
)


export const getUserListingsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    const data = await getUserListingsService(userId);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Listing fetched successfully",
      ...data
    })
  }
)

export const getListingBySlugController = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = slugSchema.parse(req.params)
    const data = await getListingBySlugService(slug);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Listing fetched successfully",
      ...data
    })
  }
)


export const getMockupUrlController = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug, colorName } = GetMockupUrlSchema.parse(req.params);

    // Composite the mockup server-side with sharp and stream the JPEG.
    // Previously this redirected to a Cloudinary overlay URL, which always
    // returned 404 because the mockup base images (dp9vvlndo account) and
    // artwork uploads (digmeghzn account) live on different Cloudinary
    // accounts — cross-account overlays are not supported by Cloudinary.
    const imageBuffer = await getMockupImageService(slug, colorName);

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Content-Length", imageBuffer.length);
    return res.status(200).send(imageBuffer);
  }
)

export const generateArtworkController = asyncHandler(
  async (req: Request, res: Response) => {
    const { prompt } = generateArtworkSchema.parse(req.body);
    const { artworkUrl } = await generateArtworkService(prompt);
    return res.status(HTTPSTATUS.CREATED).json({
      message: "Artwork generated successfully",
      artworkUrl
    })
  }
)