import { Router } from "express";
import { signin, signup } from "../controllers/auth.js";


export const authRouter: Router = Router();

authRouter.post("/signup", signup)
authRouter.post("/signin", signin)
