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
    response_time_ms: number;
    status: WebsiteStatus;
    region_id: string;
    website_id: string;
}

export async function insertWebsiteTick(checks: WebsiteTick[]): Promise<void> {
    if (checks.length === 0) return;

    console.log(`Inserting ${checks.length} records into 'uptdeime_checks'`);
    console.log('this is the checks', checks)
    try {
        let a = await clickhouseClient.insert<WebsiteTick>({
            table: tableName,
            values: checks,
            format: 'JSONEachRow',
        });

        console.log('thisiss result ', a)

    } catch (error) {
        console.error('ClickHouse Insert Error:', error);
        throw new Error('Failed to insert data into ClickHouse.');
    }
}

export async function getLatestStatus(siteId: string) {
    const query = `
        SELECT
            response_time_ms, createdAt, status, region_id, website_id
        FROM website_tick
        WHERE site_id = {siteId:String}
        ORDER BY timestamp DESC
        LIMIT 1
    `;

    const resultSet = await clickhouseClient.query({
        query,
        format: 'JSONEachRow',
    });

    const data = await resultSet.json<WebsiteTick>();
    console.log('thsi is the data ', data)
    return data.length > 0 ? data[0] : null;
}