import jwt, { JwtPayload } from "jsonwebtoken";

type UserPayload = JwtPayload & {
  userId: string;
  role: "USER" | "CURATOR" | "ADMIN";
};

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
  } catch {
    return null;
  }
}

export function getUserFromToken(req: Request): UserPayload | null {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
  } catch {
    return null;
  }
}