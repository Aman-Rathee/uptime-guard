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
        let a = await clickhouseClient.insert<WebsiteTick>({
            table: tableName,
            values: checks,
            format: 'JSONEachRow',
        });

    } catch (error) {
        console.error('ClickHouse Insert Error:', error);
        throw new Error('Failed to insert data into ClickHouse.');
    }
}

export async function getLatestStatus(websiteIds: string[]) {
    const query = `
       SELECT
            websiteId,
            argMax(responseTimeMs, createdAt)  AS responseTimeMs,
            argMax(status, createdAt)            AS status,
            argMax(regionId, createdAt)         AS regionId
        FROM website_ticks
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