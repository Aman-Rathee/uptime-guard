import { Router } from "express";
import { getStatus } from "../controllers/status.js";

export const statusRouter: Router= Router()

statusRouter.get("/:websiteId", getStatus)