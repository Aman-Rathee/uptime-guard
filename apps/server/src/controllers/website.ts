import { prisma } from "@repo/db"
import { websiteSchema } from "../types/website.js"
import { Request, Response } from "express"
import { getLastStatus, getLatestStatuses, getWebsiteStats, WebsiteStatus } from "@repo/clickhouse-client"


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
        res.status(500).json({ error: "Internal server error" })
    }
}

export const getDashboard = async (req: Request, res: Response) => {
    try {
        const websites = await prisma.website.findMany({
            where: { user_id: req.userId },
        });
        const websiteIds = websites.map(w => w.id)

        const websitesStatuses = await getLatestStatuses(websiteIds)
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

export const getWebsiteData = async (req: Request, res: Response) => {

    try {
        const website = await prisma.website.findUnique({ where: { id: req.params.id, user_id: req.userId } });

        if (!website) {
            res.status(404).json({ error: "Monitor not found" });
            return
        }

        let stats = await getWebsiteStats(website.id)
        let lastStatus = await getLastStatus(website.id)

        let totalPoints;
        let avgLatency24h;
        let uptime24h;
        if (stats) {
            totalPoints = stats.length;
            avgLatency24h = totalPoints > 0 ? stats.reduce((acc, curr) => acc + Number(curr.avg_latency), 0) / totalPoints : 0;
            uptime24h = totalPoints > 0 ? (stats.reduce((acc, curr) => acc + Number(curr.uptime_rate), 0) / totalPoints) * 100 : 0;
        }

        res.json({
            monitor: website,
            stats: {
                lastCheck: lastStatus,
                uptime24h,
                avgLatency24h,
                history: stats
            }
        });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
}