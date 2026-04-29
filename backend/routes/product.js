import express from "express";
import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductById
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);   // thêm dòng này

router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;