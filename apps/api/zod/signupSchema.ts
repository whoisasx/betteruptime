import * as z from "zod";

export const userNameSchema = z
	.string()
	.min(3, { message: "username must have atleast 3 characters." })
	.max(20, { message: "username must not exceed 20 characters." })
	.regex(/^(?![.])[a-zA-Z0-9_.,]+$/, { message: "invalid username" });

export const signupSchema = z.object({
	username: userNameSchema,
	password: z
		.string()
		.min(8, { message: "password must have atleast 8 characters." }),
});
