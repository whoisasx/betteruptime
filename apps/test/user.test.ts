import axios from "axios";
import { describe, expect, test } from "bun:test";
import { BACKEND_URL } from "./config";

const USER_NAME = Math.random().toString();

describe("sign up endpoints", () => {
	test("isnt able to sign up if body is incorrect", async () => {
		try {
			await axios.post(`${BACKEND_URL}/user/signup`, {
				email: "random email",
				password: "random password",
			});
			expect(false, "control must not reach here");
		} catch (error) {}
	});

	test("must sign up if body is correct", async () => {
		try {
			const response = await axios.post(`${BACKEND_URL}/user/signup`, {
				username: USER_NAME,
				password: "random password",
			});
			expect(response.status).toBe(201);
			expect(response.data).toBeDefined();
		} catch (error) {}
	});
});

describe("sign in endpoints", () => {
	test("isnt able to sign in if body is incorrect", async () => {
		try {
			await axios.post(`${BACKEND_URL}/user/signin`, {
				email: "random email",
				password: "random password",
			});
			expect(false, "control must not reach here");
		} catch (error) {}
	});

	test("must sign in if body is correct", async () => {
		try {
			const response = await axios.post(`${BACKEND_URL}/user/signin`, {
				username: USER_NAME,
				password: "random password",
			});
			expect(response.status).toBe(200);
			expect(response.data).toBeDefined();
		} catch (error) {}
	});
});
