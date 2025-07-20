import { websiteStream, xAck, xAckBulk, xReadGroup } from "@repo/redis";
import { prisma } from "@repo/store";
import axios from "axios";

type regionId = string;

async function fetchWebsite(
	url: string,
	website_id: string,
	region_id: string
) {
	const startTime = Date.now();
	return new Promise<void>((resolve, reject) => {
		axios
			.get(url)
			.then(async () => {
				const endTime = Date.now();
				await prisma.website_tick.create({
					data: {
						response_time: endTime - startTime,
						status: "Up",
						region_id,
						website_id,
					},
				});
				resolve();
			})
			.catch(async () => {
				const endTime = Date.now();
				await prisma.website_tick.create({
					data: {
						response_time: endTime - startTime,
						status: "Down",
						region_id,
						website_id,
					},
				});
				resolve();
			});
	});
}

async function worker(regionId: regionId[]) {
	// while (1) {
	regionId.forEach(async (region_id) => {
		for (let worker_id = 0; worker_id < 4; worker_id++) {
			const response = await xReadGroup(region_id, worker_id.toString());
			if (!response) continue;

			let promises = response.map(({ message }) =>
				fetchWebsite(message.url, message.id, region_id)
			);
			await Promise.all(promises);
			// console.log(promises.length);

			xAckBulk(
				region_id,
				response.map(({ id }) => id)
			);
		}
	});
	// }
}

async function main() {
	try {
		const region = await prisma.region.findMany();
		await websiteStream(region.map((r) => r.id));
		await worker(region.map((r) => r.id));
	} catch (err) {}
}
await main();
