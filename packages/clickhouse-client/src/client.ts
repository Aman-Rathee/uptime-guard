import { createClient } from '@clickhouse/client';
import { tableName } from './config';

export const clickhouseClient = createClient({
    password: 'password'
});

export enum WebsiteStatus {
    Up,
    Down,
    Unknown
}

export interface WebsiteTick {
    responseTimeMs: number;
    status: WebsiteStatus;
    regionId: string;
    websiteId: string;
}

export async function insertWebsiteTick(checks: WebsiteTick[]): Promise<void> {
    if (checks.length === 0) return;

    try {
        await clickhouseClient.insert<WebsiteTick>({
            table: tableName,
            values: checks,
            format: 'JSONEachRow',
        });

    } catch (error) {
        console.error('ClickHouse Insert Error:', error);
        throw new Error('Failed to insert data into ClickHouse.');
    }
}

export async function getLatestStatuses(websiteIds: string[]) {
    const query = `
       SELECT
            websiteId,
            argMax(responseTimeMs, createdAt)  AS responseTimeMs,
            argMax(status, createdAt)            AS status,
            argMax(regionId, createdAt)         AS regionId
        FROM websiteTicks
        WHERE websiteId IN {websiteIds:Array(String)}
        GROUP BY websiteId
    `;


    try {
        const resultSet = await clickhouseClient.query({
            query,
            query_params: { websiteIds },
            format: 'JSONEachRow',
        });

        const data = await resultSet.json<WebsiteTick>();

        return data.length > 0 ? data : null;
    } catch (error) {
        console.error('ClickHouse Get Statuses Error', error)
        throw new Error('Failed to get status data from ClickHouse.');
    }

}

export async function getWebsiteStats(websiteId: string, hours: number = 24) {
    try {
        const query = `
        SELECT 
            toStartOfInterval(createdAt, INTERVAL 20 minute) as createdAt,
            avg(responseTimeMs) as avg_latency,
            avg(status = 'Up') as uptime_rate,
            max(status) as worstStatus,
            (countIf(status = 'Up') * 100.0 / count()) as uptime_percentage
            
        FROM ${tableName}
        WHERE websiteId = {websiteId:String}
            AND createdAt >= now() - INTERVAL {hours:UInt8} HOUR
        GROUP BY createdAt
        ORDER BY createdAt ASC
    `;

        const logs = await clickhouseClient.query({
            query: query,
            query_params: { websiteId, hours },
            format: 'JSONEachRow'
        });

        return await logs.json() as any[];
    } catch (error) {
        console.error('Website stats error', error)
    }
}

export async function getLastStatus(websiteId: string) {
    try {
        const query = `
        SELECT status, responseTimeMs as latency, createdAt as timestamp 
        FROM ${tableName} 
        WHERE websiteId = {websiteId: String} 
        ORDER BY createdAt DESC 
        LIMIT 1
    `;

        const logs = await clickhouseClient.query({
            query: query,
            query_params: { websiteId },
            format: 'JSONEachRow'
        });

        let data = await logs.json();
        return data[0] || null;
    } catch (error) {
        console.error('Check last result error', error)
    }
}