import { xAckBulk, xReadGroup } from "@repo/redis-client"
import axios from "axios"
import { prisma } from "@repo/db"

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

        let promises = response.map(({ message }) => fetchWebsite(message.id, message.url))
        await Promise.all(promises);
        console.log(promises.length);

        const messageIds = response.map(({ id }) => id);
        await xAckBulk(REGION_ID, messageIds);
    }
}


async function fetchWebsite(websiteId: string, url: string) {
    const startTime = Date.now()

    try {
        await axios.get(url);
        const endTime = Date.now() - startTime;
        await prisma.websiteTick.create({
            data: {
                response_time_ms: endTime,
                status: "Up",
                region_id: REGION_ID,
                website_id: websiteId
            }
        });
    } catch (err) {
        const endTime = Date.now() - startTime;
        await prisma.websiteTick.create({
            data: {
                response_time_ms: endTime,
                status: "Down",
                region_id: REGION_ID,
                website_id: websiteId
            }
        });
    }
}



setInterval(main, 1000);