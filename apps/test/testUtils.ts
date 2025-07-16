import axios from "axios";
import { BACKEND_URL } from "./config";

export async function createUser(): Promise<{ id: string; jwt: string }> {
	const USER_NAME = Math.random().toString();
	try {
		const response = await axios.post(`${BACKEND_URL}/user/signup`, {
			username: USER_NAME,
			password: "myrandompassword",
		});
		return {
			id: response.data.id,
			jwt: response.data.token,
		};
	} catch (error) {
		return {
			id: "1243123",
			jwt: "sfhjasduif",
		};
	}
}
