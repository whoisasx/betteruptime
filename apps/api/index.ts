import express, { type Response } from "express";
import { prisma } from "@repo/store";
import { signupSchema } from "./zod/signupSchema";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware";
import type { IRequest } from "./types/types";
// import routerV1 from "./routes/v1";

const app = express();
app.use(express.json());

app.post("/user/signup", async (req, res) => {
	try {
		const verifyUser = signupSchema.safeParse(req.body);
		if (!verifyUser.success) {
			res.status(400).json({
				message: "invalid inputs.",
			});
			return;
		}

		const user = verifyUser.data;
		const isUserExist = await prisma.user.findFirst({
			where: {
				username: user.username,
			},
		});
		if (isUserExist) {
			res.status(400).json({
				message: "user already exist.",
			});
		}

		const hashedPassword = await Bun.password.hash(user.password);
		const newUser = await prisma.user.create({
			data: {
				username: user.username,
				password: hashedPassword,
			},
		});

		const token = jwt.sign(
			{
				userId: newUser.id,
				username: newUser.username,
			},
			process.env.JWT_SECRET ?? "my-jwt-secret",
			{
				expiresIn: "1h",
			}
		);

		res.status(201).json({
			message: "user created.",
			id: newUser.id,
			token,
		});
		return;
	} catch (error) {
		res.status(500).json({
			message: "server error",
			error: error instanceof Error ? error.message : "unknown error",
		});
	}
});
app.post("/user/signin", async (req, res) => {
	try {
		const verifyUser = signupSchema.safeParse(req.body);
		if (!verifyUser.success) {
			res.status(400).json({
				message: "bad request",
			});
			return;
		}

		const user = verifyUser.data;
		const isUserExist = await prisma.user.findFirst({
			where: {
				username: user.username,
			},
		});
		if (!isUserExist) {
			res.status(401).json({
				message: "username does not exist.",
			});
			return;
		}

		const isMatch = await Bun.password.verify(
			user.password,
			isUserExist.password
		);
		if (!isMatch) {
			res.status(401).json({
				message: "password incorrect",
			});
		}

		const token = jwt.sign(
			{
				userId: isUserExist.id,
				username: isUserExist.username,
			},
			process.env.JWT_SECRET ?? "my-jwt-secret",
			{
				expiresIn: "1h",
			}
		);

		res.status(200).json({
			message: "user signed in.",
			id: isUserExist.id,
			token,
		});
	} catch (error) {
		res.status(500).json({
			message: "server error",
			error: error instanceof Error ? error.message : "unknown error",
		});
	}
});

app.post("/website", authMiddleware, async (req: IRequest, res: Response) => {
	try {
		const userId = req.userId!;
		const username = req.username;

		const { url } = req.body;
		if (!url) {
			res.status(411).json({
				message: "url is absent.",
			});
			return;
		}

		const newWebsite = await prisma.website.create({
			data: {
				url,
				user_id: userId,
			},
		});

		res.status(201).json({
			message: "website added.",
			newWebsite,
		});
		return;
	} catch (error) {
		res.status(500).json({
			message: "server error.",
			error: error instanceof Error ? error.message : "unknown error",
		});
		return;
	}
});
app.get("/status/:websiteId", authMiddleware, async (req: IRequest, res) => {
	try {
		if (req.params.websiteId) {
			res.json(411).json({
				message: "website id is absent.",
			});
			return;
		}

		const id = req.params.websiteId;

		const website = await prisma.website.findFirst({
			where: {
				user_id: req.userId!,
				id,
			},
			include: {
				ticks: {
					orderBy: [{ createdAt: "desc" }],
					take: 1,
				},
			},
		});
		if (!website) {
			res.status(404).json({
				message: "website details not found.",
			});
			return;
		}

		res.status(200).json({
			website,
		});
		return;
	} catch (error) {
		res.status(500).json({
			message: "server error",
			error: error instanceof Error ? error.message : "unknown error",
		});
	}
});

// app.use("/api/v1", routerV1);

app.listen(process.env.PORT || 3000, () => {
	console.log(`api is listening on port: ${process.env.PORT ?? 3000}`);
});
