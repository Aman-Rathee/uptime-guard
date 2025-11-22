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


export const getDashboard = async (req: Request, res: Response) => {
    try {
        const websites = await prisma.website.findMany({
            where: { user_id: req.userId },
            include: {
                ticks: {
                    orderBy: { createdAt: "desc" },
                    take: 20,
                    include: {
                        region: true,
                    },
                },
            },
        });

        const dashboard = websites.map((w) => ({
            id: w.id,
            url: w.url,
            timeAdded: w.timeAdded,
            ticks: w.ticks,
            latestStatus: w.ticks[0]
                ? {
                    status: w.ticks[0].status,
                    responseTimeMs: w.ticks[0].response_time_ms,
                    region: w.ticks[0].region.name,
                    checkedAt: w.ticks[0].createdAt,
                }
                : null,
        }));

        res.json({ websites: dashboard });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};