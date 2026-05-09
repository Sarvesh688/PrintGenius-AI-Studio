import mongoose, { Document } from "mongoose";
import slugify from "slugify";


export interface ArtworkPlacement {
  top: number;
  left: number;
  width: number;
  height: number;
  refDisplayWidth: number;
}

export interface ListingDocument extends Document {
  userId: string;
  templateId: mongoose.Schema.Types.ObjectId;
  slug: string;
  title: string;
  description: string;
  sellingPrice: number;
  colorIds: mongoose.Schema.Types.ObjectId[];

  // Dual-side artwork
  frontArtworkUrl: string;
  frontArtworkPlacement: ArtworkPlacement;
  backArtworkUrl?: string;
  backArtworkPlacement?: ArtworkPlacement;

  // Legacy aliases (always equal to front fields)
  artworkUrl: string;
  artworkPlacement: ArtworkPlacement;

  createdAt: Date;
  updatedAt: Date;
}


const listingSchema = new mongoose.Schema<ListingDocument>(
  {
    userId: {
      type: String,
      required: true
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    colorIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductColor"
      }
    ],
    slug: {
      type: String,
      unique: true
    },

    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },

    sellingPrice: {
      type: Number,
      required: true,
    },

    // Dual-side artwork fields
    frontArtworkUrl: {
      type: String,
      required: true,
    },
    frontArtworkPlacement: {
      top: Number,
      left: Number,
      width: Number,
      height: Number,
      refDisplayWidth: Number,
    },
    backArtworkUrl: {
      type: String,
      default: undefined,
    },
    backArtworkPlacement: {
      top: { type: Number, default: undefined },
      left: { type: Number, default: undefined },
      width: { type: Number, default: undefined },
      height: { type: Number, default: undefined },
      refDisplayWidth: { type: Number, default: undefined },
    },

    // Legacy aliases (always equal to front fields)
    artworkUrl: {
      type: String,
      required: true,
    },
    artworkPlacement: {
      top: Number,
      left: Number,
      width: Number,
      height: Number,
      refDisplayWidth: Number,
    },
  }, { timestamps: true }
)

listingSchema.pre("save", function (next) {
  if (this.isNew) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true
    }) + "-" + Date.now()
  }
  next()
})

const Listing = mongoose.model<ListingDocument>("Listing",
  listingSchema
)
export default Listing
