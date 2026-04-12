import Groq from "groq-sdk";
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


export const getMockupUrlService = async (slug: string, colorName: string) => {
  const listing = await Listing.findOne({ slug })
    .populate("colorIds")
    .populate("templateId")

  if (!listing) throw new NotFoundException("Listing not found");

  const color = (listing.colorIds as any[]).find(
    (color) => toSlug(color.name) === colorName.replace(".jpg", ""))

  if (!color) throw new NotFoundException("Color not found");

  const template = listing.templateId as any;
  const printableArea = template.printableArea;
  const getPublicId = (url: string) =>
    url.split("/upload/")[1]
      .replace(/^v\d+\//, "") // remove version prefix e.g. v1773951553/
      .replace(/\.[^.]+$/, "") // remove extension
      .replace(/\//g, ":"); // slashes → colons

  const artworkPulicId = getPublicId(listing.artworkUrl);
  const mockupPublicId = getPublicId(color.mockupUrl);

  const { refDisplayWidth } = listing.artworkPlacement

  const mockup_width = 900;

  const scale = mockup_width / (refDisplayWidth ?? 662)

  const url = cloudinary.url(mockupPublicId, {
    transformation: [
      { overlay: artworkPulicId },
      {
        width: Math.round(printableArea.width * scale),
        height: Math.round(printableArea.height * scale),
        crop: "fit"
      },
      {
        flags: "layer_apply",
        gravity: "north_west",
        x: Math.round(printableArea.left * scale),
        y: Math.round(printableArea.top * scale)
      }
    ],
    format: "jpg",
    quality: 90
  })

  return url
}


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
