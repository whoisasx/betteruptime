import { expect, test, describe, beforeAll } from "bun:test";
import axios from "axios";
import { BACKEND_URL } from "./config";
import { createUser } from "./testUtils";

describe("website got created", () => {
	let token: string;

	beforeAll(async () => {
		const response = await createUser();
		token = response.jwt;
	});

	test("website not created if url is not present", async () => {
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
			expect(false, "website created when it should not");
		} catch (e) {}
	});

	test("website is created if url is present", async () => {
		try {
			const response = await axios.post(
				`${BACKEND_URL}/website`,
				{
					url: "https://google.com",
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			expect(response.data.newWebsite.not.toBeNull());
		} catch (error) {}
	});

	test("website should not be created in absence of header", async () => {
		try {
			await axios.post(
				`${BACKEND_URL}/website`,
				{
					url: "https://www.google.com",
				},
				{}
			);
			expect(false, "website is not created.");
		} catch (error) {}
	});
});

describe("can fetch website", () => {
	let token_one: string, id_one: string;
	let token_two: string, id_two: string;

	beforeAll(async () => {
		const response_one = await createUser();
		const response_two = await createUser();

		token_one = response_one.jwt;
		token_two = response_two.jwt;
		id_one = response_one.id;
		id_two = response_two.id;
	});

	test("can access website created by user", async () => {
		try {
			const createWebsite = await axios.post(
				`${BACKEND_URL}/website`,
				{
					url: "https://www.google.com",
				},
				{
					headers: {
						Authorization: `Bearer ${token_one}`,
					},
				}
			);

			const getWebsite = await axios.get(
				`${BACKEND_URL}/status/${createWebsite.data.newWebsite.id}`,
				{
					headers: {
						Authorization: `Bearer ${token_one}`,
					},
				}
			);

			expect(getWebsite.data.website.id).toBe(
				createWebsite.data.newWebsite.id
			);
			expect(getWebsite.data.website.user_id).toBe(id_one);
		} catch (error) {}
	});
	test("can not access website created by other user", async () => {
		try {
			const createWebsite = await axios.post(
				`${BACKEND_URL}/website`,
				{
					url: "https://www.google.com",
				},
				{
					headers: {
						Authorization: `Bearer ${token_one}`,
					},
				}
			);

			const getWebsite = await axios.get(
				`${BACKEND_URL}/status/${createWebsite.data.newWebsite.id}`,
				{
					headers: {
						Authorization: `Bearer ${token_one}`,
					},
				}
			);

			expect(false, "can not access website of another user.");
		} catch (error) {}
	});
});
