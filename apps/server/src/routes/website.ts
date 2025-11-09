import { Router } from "express";
import { createWebsite } from "../controllers/website.js";
import { authMiddleware } from "../middlewares/auth.js";

export const websiteRouter: Router = Router()

websiteRouter.post("/", authMiddleware, createWebsite)