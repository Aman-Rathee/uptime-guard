import { clickhouseClient } from './client';
import { tableName } from './config';

export async function initSchema() {
  console.log('⏳ Start Migrations...');

  await clickhouseClient.query({
    query: `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id UUID DEFAULT generateUUIDv4(),
        responseTimeMs Int32,
        createdAt DateTime DEFAULT now(),
        status Enum('Up' = 0, 'Down' = 1, 'Unknown' = 2),
        regionId String,
        websiteId String
      )
      ENGINE = MergeTree()
      ORDER BY id
    `,
  });

  console.log("✔️ ClickHouse schema initialized successfully.");
}


initSchema().catch(console.error)