import { Router } from "express";
import { createWebsite } from "../controllers/website.js";

export const websiteRouter: Router = Router()

websiteRouter.post("/", createWebsite)