import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyOwnerJWT } from "../middlewares/authOwner.middleware.js";

import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getOwnerProducts,
} from "../controllers/product.controller.js";

const router = Router();

// Public
router.get("/", getAllProducts);

// Owner-specific products (allow either user or owner middleware; controller accepts both)
router.get("/ownerproducts", verifyOwnerJWT, getOwnerProducts);

// Product management (protected for owners)
router.post("/add", verifyOwnerJWT, upload.single("image"), addProduct);
router.put("/:productId", verifyOwnerJWT, upload.single("image"), updateProduct);
router.delete("/:productId",verifyOwnerJWT, deleteProduct);

export default router;
