import { Request, Response } from "express";
import { signupSchema } from "../types/auth.js";
import bcrypt from "bcrypt";
import { prisma } from "@repo/db";
import jwt from "jsonwebtoken";
import { jwt_secret } from "../../config.js";


export const signup = async (req: Request, res: Response) => {

    try {
        const signupData = signupSchema.safeParse(req.body)

        if (!signupData.success) {
            res.status(400).json({ msg: "Invalid inputs" })
            return
        }
        const { email, password } = signupData.data

        const existingUser = await prisma.user.findFirst({ where: { email } })
        if (existingUser) {
            res.status(400).json({ msg: "User already exist" })
            return
        }

        const hashedPassword = await bcrypt.hash(password, 15)
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword
            }
        })

        const token = jwt.sign({ userid: user.id }, jwt_secret, { expiresIn: "7d" })

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'prod',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
        })

        res.status(200).json({ msg: "User created successfully", userId: user.id })
    } catch (err) {
        res.status(500).json({ msg: "Internal server error" })
    }

    res.send("signup")
}

export const signin = async (req: Request, res: Response) => {

    try {
        const signupData = signupSchema.safeParse(req.body)

        if (!signupData.success) {
            res.status(400).json({ msg: "Invalid inputs" })
            return
        }
        const { email, password } = signupData.data

        const user = await prisma.user.findFirst({ where: { email } })
        if (!user) {
            res.status(400).json({ msg: "Invalid credential" })
            return
        }

        const isMatch = bcrypt.compare(password, user.password)
        if (!isMatch) {
            res.status(400).json({ msg: "Invalid credential" })
        }

        const token = jwt.sign({ userid: user.id }, jwt_secret, { expiresIn: "7d" })

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'prod',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
        })

        res.status(200).json({ msg: "Logged in successfully" })

    } catch (err) {
        res.status(500).json({ msg: "Internal server error" })
    }
}
