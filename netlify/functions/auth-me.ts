import type { Handler } from "@netlify/functions";
import { requireAdmin } from "../../src/lib/server/clang-auth";

/**
 * GET /.netlify/functions/auth-me
 * The signed-in admin, from the clang-auth `ca_access` cookie:
 * 200 { email, name, roles }, 401 when signed out/expired, 403 without the grant.
 * The admin UI uses it for "Signed in as …" and to notice an expired token.
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  const auth = await requireAdmin(event);
  if (!auth.ok) return auth.response;
  const { email, name, roles } = auth.user;
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify({ email, name, roles }),
  };
};
