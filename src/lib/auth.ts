import { jwtVerify, SignJWT } from "jose";

export type UserPayload = {
  userId: string;
  role: "USER" | "CURATOR" | "ADMIN";
};

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function signToken(payload: UserPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}