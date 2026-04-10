import "dotenv/config";
import { connectDatabase } from "../config/database.config";
import ProductColor from "../models/product-color.model";

const TSHIRT_TEMPLATE_ID = "69d7a3ea6ef08bff8a105017"
const HOODIE_TEMPLATE_ID = "69d7a3ea6ef08bff8a105018"

const colors = [
  // T-Shirt Colors
  {
    templateId: TSHIRT_TEMPLATE_ID,
    name: "White",
    color: "rgb(255, 255, 255)",
    mockupUrl: "https://res.cloudinary.com/dp9vvlndo/image/upload/v1773687938/tshirt-white-mockup_zw59ck.png", // White tshirt mockup
  },
  {
    templateId: TSHIRT_TEMPLATE_ID,
    name: "Very Dark Gray",
    color: "rgb(26, 26, 26)",
    mockupUrl: "https://res.cloudinary.com/dp9vvlndo/image/upload/v1773687937/tshirt-dark-grey-mockup_bdbvfa.png", // Very dark gray tshirt mockup
  },
  {
    templateId: TSHIRT_TEMPLATE_ID,
    name: "Medium Blue",
    color: "rgb(58, 75, 152)",
    mockupUrl: "https://res.cloudinary.com/dp9vvlndo/image/upload/v1773687938/tshirt-medium-blue-mokup_ou9kry.png", // Medium blue tshirt mockup
  },
  {
    templateId: TSHIRT_TEMPLATE_ID,
    name: "Light Pink",
    color: "rgb(244, 144, 182)",
    mockupUrl: "https://res.cloudinary.com/dp9vvlndo/image/upload/v1773687938/tshirt-pink-mockup_buazv1.png", // Light pink tshirt mockup
  },
  {
    templateId: TSHIRT_TEMPLATE_ID,
    name: "Dark Green",
    color: "rgb(19, 69, 34)",
    mockupUrl: "https://res.cloudinary.com/dp9vvlndo/image/upload/v1773687936/tshirt-dark-green-mockup_m8afg9.png", // Dark green tshirt mockup
  },

  // Hoodie Colors
  {
    templateId: HOODIE_TEMPLATE_ID,
    name: "White",
    color: "rgb(255, 255, 255)",
    mockupUrl: "https://res.cloudinary.com/dp9vvlndo/image/upload/v1773687872/hoodie-white-mockup_eya9nz.png", // White hoodie mockup
  },
  {
    templateId: HOODIE_TEMPLATE_ID,
    name: "Very Dark Gray",
    color: "rgb(15, 15, 15)",
    mockupUrl: "https://res.cloudinary.com/dp9vvlndo/image/upload/v1773687871/hoodie-dark-grey-mockup_qoxxfp.png", // Very dark gray hoodie mockup
  },
  {
    templateId: HOODIE_TEMPLATE_ID,
    name: "Medium Blue",
    color: "rgb(0, 53, 148)",
    mockupUrl: "https://res.cloudinary.com/dp9vvlndo/image/upload/v1773687875/hoodie-medium-blue-mockup_tckmsu.png", // Medium blue hoodie mockup
  },
  {
    templateId: HOODIE_TEMPLATE_ID,
    name: "Red",
    color: "rgb(186, 12, 47)",
    mockupUrl: "https://res.cloudinary.com/dp9vvlndo/image/upload/v1773687873/hoodie-red-mockup_xyzke2.png", // Red hoodie mockup
  },
  {
    templateId: HOODIE_TEMPLATE_ID,
    name: "Dark Purple",
    color: "rgb(71, 10, 104)",
    mockupUrl: "https://res.cloudinary.com/dp9vvlndo/image/upload/v1773687872/hoodie-dark-purple-mockup_uiefd0.png", // Dark purple hoodie mockup
  },
];

const seedColors = async () => {
  try {
    await connectDatabase();
    const deleted = await ProductColor.deleteMany({})

    const created = await ProductColor.insertMany(colors);
    console.log(`Added the colors ${created.length}`)
  } catch (error) {
    console.log("Error occured seeding colors", error)
    process.exit(1)
  }
}

seedColors()
