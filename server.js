const express = require("express");
const fs = require("node:fs");
const path = require("node:path");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_FILE = path.join(__dirname, "data.json");
const PUBLIC_DIR = path.join(__dirname, "public");

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));
app.use(express.static(PUBLIC_DIR));

function readData() {
  try {
    const content = fs.readFileSync(DATA_FILE, "utf8");
    const data = JSON.parse(content);

    return {
      rsvps: Array.isArray(data.rsvps) ? data.rsvps : [],
      feedback: Array.isArray(data.feedback) ? data.feedback : [],
    };
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Could not read data.json:", error.message);
    }

    return { rsvps: [], feedback: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "Algo Amigo API" });
});

// Demo endpoint for checking registrations. Protect this before public deployment.
app.get("/api/rsvps", (_request, response) => {
  response.set("Cache-Control", "no-store");
  response.json(readData().rsvps);
});

app.post("/api/rsvps", (request, response) => {
  const body = request.body || {};
  const name = cleanString(body.name);
  const email = cleanString(body.email);

  if (!name || name.length > 100 || !isValidEmail(email) || email.length > 254) {
    return response.status(400).json({
      error: "Please enter a name and a valid email address.",
    });
  }

  const data = readData();
  const normalizedEmail = email.toLowerCase();
  const alreadyRegistered = data.rsvps.some(
    (rsvp) => cleanString(rsvp.email).toLowerCase() === normalizedEmail,
  );

  if (alreadyRegistered) {
    return response.status(409).json({
      error: "This email address is already registered.",
    });
  }

  const rsvp = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    year: cleanString(body.year) || "Not specified",
    interest: cleanString(body.interest) || "Not specified",
    createdAt: new Date().toISOString(),
  };

  data.rsvps.push(rsvp);

  try {
    writeData(data);
  } catch (error) {
    console.error("Could not save RSVP:", error.message);
    return response.status(500).json({
      error: "Your registration could not be saved. Please try again.",
    });
  }

  return response.status(201).json({
    message: "You're on the list. See you there!",
    rsvp: { id: rsvp.id, name: rsvp.name },
  });
});

app.post("/api/feedback", (request, response) => {
  const body = request.body || {};
  const message = cleanString(body.message);
  const email = cleanString(body.email);

  if (!message || message.length > 2000) {
    return response.status(400).json({
      error: "Please add a message (up to 2,000 characters).",
    });
  }

  if (email && !isValidEmail(email)) {
    return response.status(400).json({
      error: "Please enter a valid email address.",
    });
  }

  const data = readData();
  data.feedback.push({
    message,
    email,
    createdAt: new Date().toISOString(),
  });

  try {
    writeData(data);
  } catch (error) {
    console.error("Could not save feedback:", error.message);
    return response.status(500).json({
      error: "Your feedback could not be saved. Please try again.",
    });
  }

  return response.status(201).json({ message: "Thanks for the feedback!" });
});

app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({ error: "Please send valid JSON." });
  }

  console.error("Unexpected server error:", error.message);
  return response.status(500).json({ error: "Something went wrong." });
});

app.listen(PORT, () => {
  console.log(`Algo Amigo is running at http://localhost:${PORT}`);
});
