const BREVO_API_URL = "https://api.brevo.com/v3";

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function isValidEmail(value) {
  return typeof value === "string" &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function brevoRequest(path, apiKey, payload) {
  const response = await fetch(`${BREVO_API_URL}${path}`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error(`Brevo request failed: ${path} returned ${response.status}`);
    throw new Error("Email service request failed");
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { message: "Method not allowed" });
  }

  if (!event.body || Buffer.byteLength(event.body, "utf8") > 4096) {
    return jsonResponse(400, { message: "Invalid request" });
  }

  let signup;
  try {
    signup = JSON.parse(
      event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf8")
        : event.body,
    );
  } catch {
    return jsonResponse(400, { message: "Invalid request" });
  }

  const email = typeof signup.email === "string" ? signup.email.trim() : "";
  if (!isValidEmail(email)) {
    return jsonResponse(400, { message: "A valid email is required" });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const listId = Number(process.env.BREVO_LIST_ID);

  if (!apiKey || !senderEmail || !Number.isInteger(listId) || listId < 1) {
    console.error("Brevo signup is missing required environment configuration");
    return jsonResponse(500, { message: "Signup is temporarily unavailable" });
  }

  try {
    await brevoRequest("/contacts", apiKey, {
      email,
      listIds: [listId],
      updateEnabled: true,
    });

    await brevoRequest("/smtp/email", apiKey, {
      sender: { name: "Pod", email: senderEmail },
      to: [{ email }],
      subject: "You’re on the Pod early-access list",
      htmlContent: [
        "<html><body>",
        "<h1>Thanks for signing up for Pod early access!</h1>",
        "<p>You’re on the list. We’ll email you when Pod is ready to launch.</p>",
        "<p>As an early-access member, you’ll be among the first to try simpler,",
        " one-click podcast publishing and share feedback that helps shape Pod.</p>",
        "<p>We’re looking forward to having you with us.</p>",
        "<p>— The Pod team</p>",
        "</body></html>",
      ].join(""),
      textContent: [
        "Thanks for signing up for Pod early access!",
        "",
        "You’re on the list. We’ll email you when Pod is ready to launch.",
        "",
        "As an early-access member, you’ll be among the first to try simpler,",
        " one-click podcast publishing and share feedback that helps shape Pod.",
        "",
        "We’re looking forward to having you with us.",
        "",
        "— The Pod team",
      ].join("\n"),
    });

    return jsonResponse(200, { message: "Signup confirmed" });
  } catch (error) {
    console.error("Unable to complete early-access signup:", error.message);
    return jsonResponse(502, { message: "Unable to complete signup" });
  }
};
