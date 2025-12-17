import { Router } from "express";
import { createWebsite, getDashboard, getWebsiteData } from "../controllers/website.js";

export const websiteRouter: Router = Router()

websiteRouter.post("/", createWebsite)
websiteRouter.get("/dashboard", getDashboard)
websiteRouter.get("/:id", getWebsiteData)