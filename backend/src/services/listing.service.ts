import Groq from "groq-sdk";
import sharp from "sharp";
import cloudinary from "../config/cloudinary.config";
import { Env } from "../config/env.config";
import Listing from "../models/listing.model";
import Product from "../models/products.model";
import { BadRequestException, InternalServerException, NotFoundException } from "../utils/app-error";
import { CreateListingType } from "../validators/listing.validator";
import { SYSTEM_PROMPT } from "../utils/prompt";

//  Groq client — reads GROQ_API_KEY from your .env
const groq = new Groq({ apiKey: Env.GROQ_API_KEY });

const toSlug = (str: string) => str.toLowerCase().replace(/\s+/g, "-");

/** Fetch a remote URL and return its raw buffer */
const fetchBuffer = async (url: string): Promise<Buffer> => {
  const res = await fetch(url);
  if (!res.ok) throw new InternalServerException(`Failed to fetch image: ${url}`);
  return Buffer.from(await res.arrayBuffer());
};

export const createListingService = async (userId: string, data: CreateListingType) => {
  try {
    const template = await Product.findById(data.templateId);
    if (!template) throw new NotFoundException("Template not found");
    if (!template.template) throw new BadRequestException("Product not temp;ate");
    if (!template.basePrice) throw new BadRequestException("Product not temp;ate");

    if (data.sellingPrice < template.basePrice) {
      throw new BadRequestException(`Selling price must be at least ${template.basePrice}`);
    }

    // Upload the artwork
    const uploaded = await cloudinary.uploader.upload(
      data.artworkUrl, {
      folder: "printify-ai/artworks",
      resource_type: "image"
    }
    )

    const listing = await Listing.create({
      userId,
      templateId: data.templateId,
      title: data.title,
      description: data.description,
      sellingPrice: data.sellingPrice,
      colorIds: data.colorIds,
      artworkUrl: uploaded.secure_url,
      artworkPlacement: data.artworkPlacement
    })

    return { listing }

  } catch (error) {
    throw new InternalServerException("Internal error")
  }
}


export const getUserListingsService = async (userId: string) => {
  try {
    const listings = await Listing.find({ userId })
      .populate("templateId")
      .populate("colorIds")
      .sort({ createdAt: -1 })
      .lean()
    return { listings }
  } catch (error) {
    console.error("Error in getUserListingsService:", error);
    throw new InternalServerException("Internal Error")
  }
}

export const getListingBySlugService = async (slug: string) => {
  try {
    const listing = await Listing.findOne({ slug })
      .populate("templateId")
      .populate("colorIds")
      .lean()

    if (!listing) throw new NotFoundException("Listing not found")
    const colors = (listing.colorIds as any[]).map((color) => ({
      ...color,
      mockupImageUrl: color.name
        ? `${Env.BASE_URL}/api/listing/mockup/${slug}/${toSlug(color.name)}.jpg`
        : null
    }));
    const template = listing.templateId as any;

    return {
      listing: {
        ...listing,
        _id: listing._id,
        slug: listing.slug,
        title: listing.title,
        description: listing.description,
        sellingPrice: listing.sellingPrice,
        templateId: undefined,
        templateName: template?.name,
        templateBody: template?.body,
        sizes: template?.sizes,
        colorIds: colors
      }
    }

  } catch (error) {
    throw new InternalServerException("Internal server error")
  }
}


/**
 * Composites the listing artwork onto the colour mockup using sharp and
 * returns the final JPEG as a Buffer to be streamed directly to the browser.
 *
 * WHY NOT CLOUDINARY OVERLAYS:
 *   Cloudinary's l_ overlay transformation only works when BOTH images live
 *   on the SAME Cloudinary account.  The seeded mockup base images come from
 *   the account "dp9vvlndo" while uploaded artworks land on "digmeghzn".
 *   Every overlay URL — whether public-ID or fetch: based — returns 404
 *   because Cloudinary resolves the base image on whichever account is
 *   configured in the SDK, and that account doesn't own the other image.
 *
 * THIS APPROACH:
 *   Fetch both images server-side over plain HTTPS, composite them with
 *   sharp, and stream the result.  This is identical to what the frontend
 *   preview canvas already does — just moved to the server so the browser
 *   receives a finished JPEG via the existing /api/listing/mockup route.
 *   The controller sets immutable cache headers so it runs only once per
 *   colour per listing per client.
 */
export const getMockupImageService = async (slug: string, colorName: string): Promise<Buffer> => {
  const listing = await Listing.findOne({ slug })
    .populate("colorIds")
    .populate("templateId");

  if (!listing) throw new NotFoundException("Listing not found");

  const color = (listing.colorIds as any[]).find(
    (c) => toSlug(c.name) === colorName.replace(".jpg", "")
  );
  if (!color) throw new NotFoundException("Color not found");

  const template = listing.templateId as any;
  const printableArea = template.printableArea as {
    top: number; left: number; width: number; height: number;
  };

  const { refDisplayWidth } = listing.artworkPlacement;

  // Fetch both images in parallel
  const [mockupBuf, artworkBuf] = await Promise.all([
    fetchBuffer(color.mockupUrl),
    fetchBuffer(listing.artworkUrl),
  ]);

  // Get mockup natural dimensions
  const mockupMeta = await sharp(mockupBuf).metadata();
  const mockupW = mockupMeta.width!;

  // Scale factor: map canvas DISPLAY_SIZE (662 px) → mockup natural width
  const scale = mockupW / (refDisplayWidth ?? 662);

  // Compute where the artwork lands on the mockup
  const destX = Math.round(printableArea.left * scale);
  const destY = Math.round(printableArea.top * scale);
  const destW = Math.round(printableArea.width * scale);
  const destH = Math.round(printableArea.height * scale);

  // Resize artwork to fit the printable area, preserving aspect ratio
  const resizedArtwork = await sharp(artworkBuf)
    .resize(destW, destH, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Composite artwork over mockup and encode as JPEG
  const composited = await sharp(mockupBuf)
    .composite([{ input: resizedArtwork, left: destX, top: destY }])
    .jpeg({ quality: 90 })
    .toBuffer();

  return composited;
};


export const generateArtworkService = async (prompt: string) => {
  try {

    // -------------------------------------------------------
    // STEP 1: Groq (FREE) — Llama rewrites user prompt into
    //         a detailed art prompt using your SYSTEM_PROMPT
    // -------------------------------------------------------
    const chat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
    });

    const engineeredPrompt = chat.choices[0]?.message?.content?.trim();
    if (!engineeredPrompt) throw new InternalServerException("Prompt engineering failed");

    // -------------------------------------------------------
    // STEP 2: Pollinations.ai (FREE, NO API KEY NEEDED)
    //         Generates a 1024x1024 image using FLUX model
    // -------------------------------------------------------
    const encodedPrompt = encodeURIComponent(engineeredPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&nologo=true&seed=${Date.now()}`;

    // -------------------------------------------------------
    // STEP 3: Upload the Pollinations image URL to Cloudinary
    // -------------------------------------------------------
    const uploadImg = await cloudinary.uploader.upload(imageUrl, {
      folder: "printify-ai/artworks",
      resource_type: "image",
    });

    // -------------------------------------------------------
    // STEP 4: Remove background via Remove.bg (unchanged)
    // -------------------------------------------------------
    const formData = new FormData();
    formData.append("image_url", uploadImg.secure_url);
    formData.append("size", "auto");

    const bgRes = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": Env.REMOVE_BG_API_KEY! },
      body: formData,
    });

    if (!bgRes.ok) {
      throw new InternalServerException("Background removal failed");
    }

    const bgBuffer = Buffer.from(await bgRes.arrayBuffer());

    const finalUpload = await cloudinary.uploader.upload(
      `data:image/png;base64,${bgBuffer.toString("base64")}`, {
      folder: "printify-ai/artworks",
      resource_type: "image",
    });

    return { artworkUrl: finalUpload.secure_url };

  } catch (error) {
    throw new InternalServerException("Failed to generate artwork");
  }
}