// This is a placeholder backend for the custom 0auth-pinger api.
// It's opensource so if you want something like this you can use it
export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const GITHUB_CLIENT_ID = ""; // your app's client_id
    const GITHUB_CLIENT_SECRET = ""; // your app's secret
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const { code, code_verifier, redirect_uri } = body;

    if (!code || !redirect_uri || !code_verifier) {
      return json({ error: "Missing 'code', 'redirect_uri', or 'code_verifier'" }, 400);
    }

    const payload = {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri,
      code_verifier,
      grant_type: "authorization_code"
    };

    const ghRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await ghRes.json();

    if (!ghRes.ok || data.error) {
      return json(
        {
          error: data.error || "token_exchange_failed",
          error_description: data.error_description || "GitHub token exchange failed",
          details: data,
        },
        ghRes.status || 400
      );
    }

    return json(data, 200);
  },
};

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Vary": "Origin",
    },
  });
}
