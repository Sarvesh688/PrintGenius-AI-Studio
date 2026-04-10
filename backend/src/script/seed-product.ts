import "dotenv/config"
import { connectDatabase } from "../config/database.config";
import Product, { ProductType, Section, SIZE_OPTIONS } from "../models/products.model";


const TSHIRT_TRANSPARENT_IMAGE_URL = "https://res.cloudinary.com/dp9vvlndo/image/upload/v1773687866/t-shirt-transparent-front_ulejct.png"
const HOODIE_TRANSPARENT_IMAGE_URL = "https://res.cloudinary.com/dp9vvlndo/image/upload/v1773687868/hoodies-transparent-front_u5bfn3.png"
const TSHIRT_PRINTABLE_AREA = {
  top: 177,
  left: 216,
  width: 247,
  height: 329
};
const HOODIE_PRINTABLE_AREA = {
  top: 197,
  left: 188,
  width: 284,
  height: 223
};


const products = [
  //Default template for editor
  {
    type: ProductType.TSHIRT,
    template: true,
    section: Section.CATALOG,
    name: "Classic Crew Neck T-Shirt",
    body: "Classic, 100% Airlum Combed and Ring-Spun Cotton",
    basePrice: 22.99,
    sizes: SIZE_OPTIONS,
    baseUrl: TSHIRT_TRANSPARENT_IMAGE_URL,
    displayUrl: "https://res.cloudinary.com/dp9vvlndo/image/upload/v1773689131/featured_product_2_1746137518653_uor1ax.png",
    printableArea: TSHIRT_PRINTABLE_AREA,
  },
  {
    type: ProductType.HOODIE,
    template: true,
    section: Section.CATALOG,
    name: "Unisex Classic Pullover Hoodie",
    body: "Classic, 80% Cotton",
    basePrice: 39.99,
    sizes: SIZE_OPTIONS,
    baseUrl: HOODIE_TRANSPARENT_IMAGE_URL,
    displayUrl: "https://res.cloudinary.com/dp9vvlndo/image/upload/v1773689131/featured_product_4_1746137644730_ctynsg.png",
    printableArea: HOODIE_PRINTABLE_AREA,
  },

  //Not the default template for display only
  {
    type: ProductType.TSHIRT,
    template: false,
    section: Section.CATALOG,
    name: "Women's Classic T-Shirt",
    body: "Classic, 100% Airlum Combed and Ring-Spun Cotton",
    displayUrl: "https://res.cloudinary.com/dp9vvlndo/image/upload/v1773689131/featured_product_3_1746137611266_jctugl.png",
  },
  {
    type: ProductType.TSHIRT,
    template: false,
    section: Section.FEATURED,
    name: "Relaxed Fit Basic T-Shirt",
    body: "100% Combed Ring-Spun Cotton, lightweight",
    displayUrl: "https://res.cloudinary.com/dp9vvlndo/image/upload/v1773689759/model-03642-preview_compressed_wz5n8y.webp",
  },
  {
    type: ProductType.TSHIRT,
    template: false,
    section: Section.FEATURED,
    name: "Relaxed Fit T-Shirt",
    body: "100% Combed Ring-Spun Cotton, Breathable",
    displayUrl: "https://res.cloudinary.com/dp9vvlndo/image/upload/v1773689759/model-03661-preview_compressed_p6m3s6.webp",
  },
  {
    type: ProductType.HOODIE,
    template: false,
    section: Section.FEATURED,
    name: "Soft Fleece Hoodie",
    body: "80% Cotton, 20% Polyester, fleece lined",
    displayUrl: "https://res.cloudinary.com/dp9vvlndo/image/upload/v1773689760/hoodie-1868-preview_nmxlky.webp",
  },
  {
    type: ProductType.HOODIE,
    template: false,
    section: Section.FEATURED,
    name: "Classic Pullover Hoodie",
    body: "80% Cotton, 20% Polyester, kangaroo pocket",
    displayUrl: "https://res.cloudinary.com/dp9vvlndo/image/upload/v1773689759/hoodie-1866-preview_gwckg3.webp",
  },
];


const seedProducts = async () => {
  try {
    await connectDatabase();
    const deleted = await Product.deleteMany({});
    console.log(`Cleared ${deleted.deletedCount} existing product`)
    // insert
    const created = await Product.insertMany(products);
    console.log(`Seeded ${created.length} product`);
    created.forEach((pr) => console.log(`-${pr._id} ${pr.name}`))
  } catch (error) {
    console.log(error, "Error seesing products");
    process.exit(1)
  }
}

seedProducts()
