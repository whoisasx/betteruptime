import type { NextFunction, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { IRequest } from "./types/types";

export function authMiddleware(
	req: IRequest,
	res: Response,
	next: NextFunction
) {
	const authToken = req.headers.authorization;
	if (!authToken) {
		res.status(401).json({
			message: "authorization header is absent.",
		});
		return;
	}

	const token = authToken.split(" ")[1];
	try {
		const data = jwt.verify(
			token as string,
			process.env.JWT_SECRET!
		) as JwtPayload;
		req.userId = data.userId as string;
		req.username = data.username as string;
		next();
	} catch (error) {
		res.status(403).json({
			message: "forbidden",
		});
	}
}
