import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken";
import { jwt_secret } from "../../config.js";


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ msg: "Unauthorized user" })
        return
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token!, jwt_secret) as JwtPayload
        req.userId = decoded.userId
        next()

    } catch (err) {
        res.status(401).json({ msg: "Unauthorized: Invalid or expired token" })
    }

}