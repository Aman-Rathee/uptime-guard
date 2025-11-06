import { prisma } from "@repo/db"
import { websiteSchema } from "../types/website.js"
import { Request, Response } from "express"


export const createWebsite = async (req: Request, res: Response) => {
    try {
        const websiteData = websiteSchema.safeParse(req.body)
        if (!websiteData.success) {
            res.status(400).json({ msg: "Invalid inputs" })
            return
        }

        const website = await prisma.website.create({
            data: {
                url: websiteData.data.url,
                user_id: req.userId!
            }
        })

        res.json({ id: website.id })


    } catch (err) {
        res.status(500).json({ msg: "Internal server error" })
    }
}