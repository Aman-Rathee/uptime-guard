import { xAckBulk, xReadGroup, wasAlertSent, markAlertSent, clearAlertSent } from "@repo/redis-client"
import axios from "axios"
import { insertWebsiteTick, WebsiteStatus, getLastUpTimestamp } from "@repo/clickhouse-client"
import nodemailer from "nodemailer"
import { prisma } from "@repo/db"
import "dotenv/config"

const REGION_ID = process.env.REGION_ID!;
const WORKER_ID = process.env.WORKER_ID!;

if (!REGION_ID) {
    throw new Error("Region not provided");
}

if (!WORKER_ID) {
    throw new Error("Region not provided");
}


async function main() {
    while (true) {
        const response = await xReadGroup(REGION_ID, WORKER_ID);

        if (!response) continue;

        let checks = await Promise.all(
            response.map(({ message }) =>
                fetchWebsite(message.id, message.url)
            )
        );

        await insertWebsiteTick(checks);

        // After storing ticks, evaluate alerts
        for (const c of checks) {
            try {
                if (c.status === WebsiteStatus.Down) {
                    const already = await wasAlertSent(c.websiteId);
                    if (already) continue;

                    const lastUp = await getLastUpTimestamp(c.websiteId);
                    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

                    if (!lastUp || lastUp < fiveMinutesAgo) {
                        await sendDownAlert(c.websiteId, c);
                        await markAlertSent(c.websiteId);
                    }
                } else {
                    await clearAlertSent(c.websiteId);
                }
            } catch (err) {
                console.error('Alert processing error', err);
            }
        }

        console.log(checks.length);

        const messageIds = response.map(({ id }) => id);
        await xAckBulk(REGION_ID, messageIds);
    }
}


async function fetchWebsite(websiteId: string, url: string) {
    const startTime = Date.now()

    try {
        await axios.get(url);
        return {
            responseTimeMs: Date.now() - startTime,
            status: WebsiteStatus.Up,
            regionId: REGION_ID,
            websiteId
        };
    } catch (err) {
        return {
            responseTimeMs: Date.now() - startTime,
            status: WebsiteStatus.Down,
            regionId: REGION_ID,
            websiteId
        };
    }
}


function getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        throw new Error('SMTP configuration missing (SMTP_HOST/SMTP_USER/SMTP_PASS)')
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
    });
}

async function sendDownAlert(websiteId: string, check: { responseTimeMs: number; status: WebsiteStatus; regionId: string; websiteId: string }) {
    const website = await prisma.website.findUnique({ where: { id: websiteId }, include: { user: true } });
    if (!website || !website.user) return;
    const to = website.user.email;
    const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
    if (!to || !from) return;

    const transporter = getTransporter();

    const mail = {
        from,
        to: 'ratheeaman65@gmail.com',
        subject: `Your website appears down: ${website.url}`,
        text: `We detected that your website ${website.url} appears to be down. We haven't seen an Up status for over 5 minutes.`
    };

    try {
        await transporter.sendMail(mail);
        console.log(`Sent downtime alert to ${to} for website ${websiteId}`);
    } catch (err) {
        console.error('Failed to send alert email', err);
    }
}



setInterval(main, 10000);