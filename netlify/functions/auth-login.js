import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

/**
 * Login Netlify Function
 */
export const handler = async (event, context) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    // Validate input
    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Username and password are required" }),
      };
    }

    // Check credentials from environment
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminUsername || !adminPasswordHash) {
      console.error("ADMIN_USERNAME or ADMIN_PASSWORD_HASH not configured");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Server configuration error" }),
      };
    }

    if (username !== adminUsername) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }

    // Check password using bcrypt
    const isValidPassword = await bcrypt.compare(password, adminPasswordHash);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        username: adminUsername,
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.AUTH_SECRET,
      {
        expiresIn: "24h",
      }
    );

    // Set HTTP-only cookie (Secure only in production)
    const isProduction = process.env.CONTEXT === 'production' || process.env.NODE_ENV === 'production';
    const cookieHeader = `auth_token=${token}; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Lax; Path=/; Max-Age=86400`;

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Set-Cookie': cookieHeader,
      },
      body: JSON.stringify({
        success: true,
        user: {
          username: adminUsername,
        },
        expiresIn: 86400, // 24 hours in seconds
      }),
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: "Invalid request",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
    };
  }
};
