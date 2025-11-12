import { createClient } from "redis";

interface WebsiteDataType {
    id: string,
    url: string
}

interface MessageType {
    id: string;
    message: {
        id: string,
        url: string
    }
}

const streamKey = "uptime-guard:website"

const client = await createClient()
    .on("error", (err) => console.log("Redis client error", err))
    .connect();


export const xAddBulk = async (websites: WebsiteDataType[]) => {
    if (!websites.length) return;

    const multi = client.multi();

    for (const w of websites) {
        await multi.xAdd(
            streamKey, "*", {
            id: w.id.toString(),
            url: w.url,
        });
    }
    await multi.exec();
}


export async function xReadGroup(workerGroup: string, workerId: string) {

    const res = await client.xReadGroup(
        workerGroup, workerId, {
        key: streamKey,
        id: '>'
    }, {
        COUNT: 10
    });

    if (!res) return [];
    if (!Array.isArray(res)) return [];
    if (!res[0] || typeof res[0] !== 'object' || !('messages' in res[0])) {
        return [];
    }

    const messages = res[0].messages as MessageType[]
    return messages;
}


export async function xAckBulk(consumerGroup: string, eventIds: string[]) {
    const multi = client.multi();
    eventIds.forEach(id => {
        multi.xAck(streamKey, consumerGroup, id);
    });
    await multi.exec();
}