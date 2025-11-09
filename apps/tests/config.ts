import "dotenv/config"

if (!process.env.BACKEND_URL) {
    throw new Error("BACKEND_URL is not defined in environment variables");
}

export const backend_url = process.env.BACKEND_URL;