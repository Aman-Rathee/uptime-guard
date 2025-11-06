import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken";
import { jwt_secret } from "../../config.js";


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
        res.status(401).json({ msg: "Unauthorized user" })
        return
    }

    try {
        const decoded = jwt.verify(token, jwt_secret) as JwtPayload
        req.userId = decoded.userId
        next()

    } catch (err) {
        res.status(401).json({ msg: "Unauthorized: Invalid or expired token" })
    }

}