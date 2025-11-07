import jwt, {
  type JwtPayload,
  type Secret,
  type SignOptions,
} from "jsonwebtoken";

type TokenPayload = {
  sub: string;
  email: string;
  role: "admin" | "user";
  name: string;
};

function getSecret(): Secret {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET nao configurado");
  }
  return secret;
}

export function signAccessToken(payload: TokenPayload) {
  const secret = getSecret();
  const expiresInSetting = (process.env.JWT_EXPIRES_IN || "1h") as NonNullable<
    SignOptions["expiresIn"]
  >;
  const options: SignOptions = {
    expiresIn: expiresInSetting,
  };
  return jwt.sign(payload as JwtPayload, secret, options);
}

export function verifyAccessToken(
  token: string
): (TokenPayload & jwt.JwtPayload) | null {
  try {
    const secret = getSecret();
    return jwt.verify(token, secret) as TokenPayload & jwt.JwtPayload;
  } catch {
    return null;
  }
}

export type AuthTokenPayload = TokenPayload;
