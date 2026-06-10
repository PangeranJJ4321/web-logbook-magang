import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secure-jwt-secret-web-logbook-magang-2026'
);

export interface UserSessionPayload {
  userId: string;
  email: string;
  fullName: string;
}

// Signs a JWT with the user details
export async function signJWT(payload: UserSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Session expires in 7 days
    .sign(JWT_SECRET);
}

// Verifies a JWT token, returning the payload if valid, or null if invalid
export async function verifyJWT(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      fullName: payload.fullName as string,
    };
  } catch (error) {
    return null;
  }
}
