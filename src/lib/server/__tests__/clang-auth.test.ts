import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  SignJWT,
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  type CryptoKey,
} from "jose";
import { requireAdmin, setJwksForTesting, type FunctionEvent } from "../clang-auth";
import { handler as authMe } from "../../../../netlify/functions/auth-me";

const AUTH = "https://auth.clintonlangosch.com";
const ORIGIN = "https://clintonlangosch.com";

let key: CryptoKey;
let otherKey: CryptoKey;

beforeAll(async () => {
  process.env.AUTH_BASE_URL = AUTH;
  process.env.AUTH_APP_SLUG = "portfolio";
  process.env.APP_ORIGIN = ORIGIN;
  const kp = await generateKeyPair("ES256");
  key = kp.privateKey;
  otherKey = (await generateKeyPair("ES256")).privateKey;
  const jwk = { ...(await exportJWK(kp.publicKey)), kid: "k1", alg: "ES256", use: "sig" };
  setJwksForTesting(createLocalJWKSet({ keys: [jwk] }));
});

afterAll(() => setJwksForTesting(undefined));

async function token(opts: {
  apps?: Record<string, string[]>;
  iss?: string;
  expSecondsFromNow?: number;
  signWith?: CryptoKey;
} = {}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    email: "me@example.com",
    name: "Me",
    apps: opts.apps ?? { portfolio: ["admin"] },
  })
    .setProtectedHeader({ alg: "ES256", kid: "k1" })
    .setSubject("user-1")
    .setIssuer(opts.iss ?? AUTH)
    .setIssuedAt(now - 60)
    .setExpirationTime(now + (opts.expSecondsFromNow ?? 900))
    .sign(opts.signWith ?? key);
}

function event(opts: {
  method?: string;
  cookie?: string;
  origin?: string;
  referer?: string;
  authorization?: string;
} = {}): FunctionEvent {
  const headers: Record<string, string> = {};
  if (opts.cookie) headers.cookie = opts.cookie;
  if (opts.origin) headers.origin = opts.origin;
  if (opts.referer) headers.referer = opts.referer;
  if (opts.authorization) headers.authorization = opts.authorization;
  return { httpMethod: opts.method ?? "GET", headers };
}

async function check(e: FunctionEvent) {
  const res = await requireAdmin(e);
  if (res.ok) return { status: 200, user: res.user, token: res.token };
  return { status: res.status, body: JSON.parse(res.response.body) };
}

describe("requireAdmin", () => {
  it("lets an admin through and returns the user and token", async () => {
    const t = await token();
    const res = await check(event({ method: "POST", origin: ORIGIN, cookie: `other=1; ca_access=${t}` }));
    expect(res.status).toBe(200);
    expect(res.user).toEqual({ sub: "user-1", email: "me@example.com", name: "Me", roles: ["admin"] });
    expect(res.token).toBe(t);
  });

  it("allows GET without an Origin header", async () => {
    expect((await check(event({ cookie: `ca_access=${await token()}` }))).status).toBe(200);
  });

  it("401s without the cookie, and ignores an Authorization header", async () => {
    const res = await check(event({ method: "POST", origin: ORIGIN, authorization: `Bearer ${await token()}` }));
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHENTICATED");
  });

  it("401s an expired token", async () => {
    expect((await check(event({ cookie: `ca_access=${await token({ expSecondsFromNow: -120 })}` }))).status).toBe(401);
  });

  it("401s a token from another issuer", async () => {
    expect((await check(event({ cookie: `ca_access=${await token({ iss: "https://evil.example" })}` }))).status).toBe(401);
  });

  it("401s a token signed by an unknown key", async () => {
    expect((await check(event({ cookie: `ca_access=${await token({ signWith: otherKey })}` }))).status).toBe(401);
  });

  it("401s an unsigned (alg none) token", async () => {
    const enc = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
    const now = Math.floor(Date.now() / 1000);
    const forged = `${enc({ alg: "none" })}.${enc({ sub: "x", iss: AUTH, exp: now + 900, apps: { portfolio: ["admin"] } })}.`;
    expect((await check(event({ cookie: `ca_access=${forged}` }))).status).toBe(401);
  });

  it("403s a user with no grant for this app", async () => {
    const res = await check(event({ cookie: `ca_access=${await token({ apps: { lexicon: ["admin"] } })}` }));
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  it("403s a user with a grant but not the admin role", async () => {
    expect((await check(event({ cookie: `ca_access=${await token({ apps: { portfolio: ["viewer"] } })}` }))).status).toBe(403);
  });

  it("403s a state-changing request from another origin", async () => {
    const cookie = `ca_access=${await token()}`;
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      const res = await check(event({ method, cookie, origin: "https://lexicon.clintonlangosch.com" }));
      expect(res.status).toBe(403);
    }
  });

  it("403s a state-changing request with no Origin or Referer", async () => {
    expect((await check(event({ method: "DELETE", cookie: `ca_access=${await token()}` }))).status).toBe(403);
  });

  it("accepts a same-origin Referer when Origin is missing", async () => {
    const res = await check(event({ method: "PUT", cookie: `ca_access=${await token()}`, referer: `${ORIGIN}/admin/skills` }));
    expect(res.status).toBe(200);
  });

  it("500s when auth isn't configured", async () => {
    const saved = process.env.APP_ORIGIN;
    delete process.env.APP_ORIGIN;
    try {
      expect((await check(event({ cookie: `ca_access=${await token()}` }))).status).toBe(500);
    } finally {
      process.env.APP_ORIGIN = saved;
    }
  });
});

describe("auth-me", () => {
  async function me(e: FunctionEvent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = (await authMe(e as any, {} as any)) as { statusCode: number; body: string };
    return { status: res.statusCode, body: JSON.parse(res.body) };
  }

  it("returns the signed-in admin", async () => {
    const { status, body } = await me(event({ cookie: `ca_access=${await token()}` }));
    expect(status).toBe(200);
    expect(body).toEqual({ email: "me@example.com", name: "Me", roles: ["admin"] });
  });

  it("401s when signed out", async () => {
    expect((await me(event())).status).toBe(401);
  });

  it("403s without the grant", async () => {
    expect((await me(event({ cookie: `ca_access=${await token({ apps: {} })}` }))).status).toBe(403);
  });
});
