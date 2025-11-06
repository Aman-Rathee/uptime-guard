import { Router } from "express";
import { authRouter } from "./auth.js";
import { websiteRouter } from "./website.js";
import { statusRouter } from "./status.js";
import { authMiddleware } from "../middlewares/auth.js";

export const router: Router = Router();

router.use("/auth", authRouter)
router.use("/website", authMiddleware, websiteRouter)
router.use("/status", authMiddleware, statusRouter)