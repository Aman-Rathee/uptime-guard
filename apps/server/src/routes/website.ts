import { Router } from "express";
import { createWebsite, getDashboard } from "../controllers/website.js";

export const websiteRouter: Router = Router()

websiteRouter.post("/", createWebsite)
websiteRouter.get("/dashboard", getDashboard)