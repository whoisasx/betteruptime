import { createClient, type RedisClientType } from "redis";

const client: RedisClientType = createClient();
client.on("error", (err) => console.log("redis client error: ", err));
await client.connect();

type websiteEvent = {
	url: string;
	id: string;
};
type regionId = string;
type MessageType = {
	id: string;
	message: {
		url: string;
		id: string;
	};
};
type messageId = string;

export async function xAdd(website: websiteEvent) {}
export async function xAddBulk(website: websiteEvent[]) {
	// console.log(website);
	website.forEach(async (w) => {
		await client.xAdd("betteruptime:website", "*", {
			url: w.url,
			id: w.id,
		});
	});
}

export async function xReadGroup(
	region_id: string,
	worker_id: string
): Promise<MessageType[] | undefined> {
	console.log(`${region_id} -- ${worker_id}`);
	const response = await client.xReadGroup(
		region_id,
		worker_id,
		{
			key: "betteruptime:website",
			id: ">",
		},
		{
			COUNT: 2,
		}
	);
	if (!response) return undefined;
	// console.log(response[0]?.messages);
	let message: MessageType[] | undefined = response?.[0]?.messages?.map(
		(msg) => ({
			id: msg.id,
			message: {
				url: msg.message.url ?? "",
				id: msg.message.id ?? "",
			}, // Default to empty string if undefined
		})
	);
	// console.log(message);
	return message;
}

export async function xAck(region_id: string, message_id: string) {}

export async function xAckBulk(region_id: regionId, message_ids: messageId[]) {
	message_ids.forEach((message_id) =>
		client.xAck("betteruptime:website", region_id, message_id)
	);
}

async function ensureGroup(name: string) {
	try {
		await client.xGroupCreate("betteruptime:website", name, "0", {
			MKSTREAM: true,
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : "unknown error";
		if (message.includes("BUSYGROUP")) {
		} else {
		}
	}
}

export async function websiteStream(region: regionId[]) {
	region.forEach(async (id) => await ensureGroup(id));
}
