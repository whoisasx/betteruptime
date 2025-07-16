import axios from "axios";
import { describe, expect, test } from "bun:test";
import { BACKEND_URL } from "./config";

describe("website gets created", () => {
	let token: string = "";
	test("website is not created if url is absent", async () => {
		try {
			await axios.post(
				`${BACKEND_URL}/website`,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
		} catch {}
	});

	test("website is not created if header is missing", async () => {
		try {
			const response = await axios.post(`${BACKEND_URL}/website`, {
				url: "https://www.google.com",
			});
			expect(false, "website should not be created if header is absent.");
		} catch (error) {}
	});
});
