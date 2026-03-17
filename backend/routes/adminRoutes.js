import { Router } from "express";
import {
  createCategory,
  createProduct,
  getCategories,
  getDashboard,
  getProducts,
  getUsers,
  toggleUserBlock
} from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, adminOnly);
router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.get("/products", getProducts);
router.post("/products", createProduct);
router.patch("/users/:id/block", toggleUserBlock);

export default router;
