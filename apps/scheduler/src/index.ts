import { prisma } from "@repo/db"
import { xAddBulk } from "@repo/redis-client";


const schedulerChecks = async () => {
    const websites = await prisma.website.findMany({
        select: {
            id: true,
            url: true
        }
    })

    await xAddBulk(websites.map(w => ({
        id: w.id,
        url: w.url
    })))

}

setInterval(schedulerChecks, 3 * 1000 * 60);