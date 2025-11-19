import { createClient, RedisClientType } from "redis";

interface WebsiteDataType {
    id: string;
    url: string;
}

interface MessageType {
    id: string;
    message: {
        id: string;
        url: string;
    }
}

const streamKey = "uptime-guard:website"

let client: RedisClientType | null = null;

async function getClient() {
    if (client && client.isOpen) return client;

    client = createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379"
    });

    client.on("error", (err) => console.error("Redis Client Error", err));

    await client.connect();
    return client;
}


export const xAddBulk = async (websites: WebsiteDataType[]) => {
    if (!websites.length) return;
    const redis = await getClient();
    const multi = redis.multi();

    for (const w of websites) {
        multi.xAdd(
            streamKey, "*", {
            id: w.id.toString(),
            url: w.url,
        });
    }
    await multi.exec();
}


export async function xReadGroup(workerGroup: string, workerId: string) {
    const redis = await getClient();

    const res = await redis.xReadGroup(
        workerGroup, workerId, {
        key: streamKey,
        id: '>'
    }, {
        COUNT: 10
    });

    if (!res || res.length === 0) return [];
    if (!res[0] || typeof res[0] !== 'object' || !('messages' in res[0])) {
        return [];
    }

    const messages = res[0].messages as MessageType[]
    return messages;
}


export async function xAckBulk(consumerGroup: string, eventIds: string[]) {
    if (eventIds.length === 0) return;
    const redis = await getClient();
    const multi = redis.multi();
    eventIds.forEach(id => {
        multi.xAck(streamKey, consumerGroup, id);
    });
    await multi.exec();
}