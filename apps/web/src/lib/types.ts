export enum WebsiteStatus {
    Up = "Up",
    Down = "Down",
    Unknown = "Unknown",
}

export interface WebsiteTick {
    id: string;
    response_time_ms: number;
    createdAt: Date;
    status: WebsiteStatus;
    region_id: string;
    website_id: string;
    region: {
        id: string;
        name: string;
    };
}

export interface Website {
    id: string;
    url: string;
    timeAdded: Date;
    ticks: WebsiteTick[];
    latestStatus: {
        status: WebsiteStatus;
        responseTimeMs: number;
        region: string;
        checkedAt: Date;
    }
}