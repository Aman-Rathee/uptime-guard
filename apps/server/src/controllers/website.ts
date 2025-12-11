import { prisma } from "@repo/db"
import { websiteSchema } from "../types/website.js"
import { Request, Response } from "express"
import { getLatestStatus, WebsiteStatus } from "@repo/clickhouse-client"


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
        });
        const websiteIds = websites.map(w => w.id)

        const websitesStatuses = await getLatestStatus(websiteIds)
        const statusMap = new Map(
            websitesStatuses?.map(s => [s.websiteId, s])
        );

        const dashboard = websites.map((w) => {
            const status = statusMap.get(w.id);

            return {
                id: w.id,
                url: w.url,
                timeAdded: w.timeAdded,
                responseTimeMs: status?.responseTimeMs ?? null,
                status: status?.status ?? WebsiteStatus.Unknown,
                region: status?.regionId ?? null,
                checkedAt: status?.websiteId ?? null
            }
        });

        res.json({ dashboard });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};