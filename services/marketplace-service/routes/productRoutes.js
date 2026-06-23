const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  getProductBySlug,
  getProductsByCategory,
  getFeaturedProducts,
  createProduct,
  getLatestProducts,
  getHotProducts,
  updateProduct,
  deleteProduct,
  getPersonalizedFeed,
} = require("../controller/product-controller");

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
} = require("../controller/category-controller");

// Import authentication middleware
const { protect, authorizeAny } = require("../../../global/middlewares/authMiddleware");

// Public read-only routes
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/categories", getCategories);
router.get("/latest", getLatestProducts);
router.get("/hot", getHotProducts);
router.get("/feed", getPersonalizedFeed);
router.get("/category/:category", getProductsByCategory);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);

// Protected write routes - any authenticated user
router.post("/categories", protect, authorizeAny, createCategory);
router.put("/categories/:id", protect, authorizeAny, updateCategory);
router.delete("/categories/:id", protect, authorizeAny, deleteCategory);
router.post("/subcategories", protect, authorizeAny, createSubcategory);

router.post("/", protect, authorizeAny, createProduct);
router.put("/:id", protect, authorizeAny, updateProduct);
router.delete("/:id", protect, authorizeAny, deleteProduct);

module.exports = router;
