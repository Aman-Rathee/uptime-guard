import { prisma } from "@repo/db";
import { Request, Response } from "express";


export const getStatus = async (req: Request, res: Response) => {
    try {
        const website = await prisma.website.findFirst({
            where: {
                user_id: req.userId,
                id: req.params.websiteId
            },
            include: {
                ticks: {
                    orderBy: [{
                        createdAt: 'desc',
                    }],
                    take: 1
                }
            }
        })

        if (!website) {
            res.status(409).json({ msg: "Website Not found" })
            return;
        }

        res.json({
            url: website.url,
            id: website.id,
            user_id: website.user_id
        })

    } catch (err) {
        res.status(500).json({ msg: "Internal server error" })
    }
}