import { websiteStream, xAddBulk } from "@repo/redis";
import { prisma } from "@repo/store";

async function pusher() {
	try {
		const website = await prisma.website.findMany({
			select: {
				id: true,
				url: true,
			},
		});
		// console.log(website);
		await xAddBulk(
			website.map((w) => ({
				url: w.url,
				id: w.id,
			}))
		);
	} catch (err) {}
}

async function main() {
	//put it into the interval.
	await pusher();
}
await main();
