import { xAckBulk, xReadGroup } from "@repo/redis-client"
import axios from "axios"
import { insertWebsiteTick, WebsiteStatus } from "@repo/clickhouse-client"

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



setInterval(main, 1000);