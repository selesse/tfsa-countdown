import {
  addContribution,
  getAllContributions,
  getTotalContributed,
} from "./database";
import { computeYearStatus, TOTAL_ROOM } from "./tfsa";

const PORT = Number.parseInt(process.env.PORT || "3000");

// Build client bundle on startup
const buildResult = await Bun.build({
  entrypoints: ["./src/client/main.tsx"],
  outdir: "./dist",
  minify: process.env.NODE_ENV === "production",
});

if (!buildResult.success) {
  console.error("Client build failed:");
  for (const log of buildResult.logs) {
    console.error(log);
  }
  process.exit(1);
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TFSA Countdown</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f0f1a;
      color: #eee;
      min-height: 100vh;
    }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="/bundle.js"></script>
</body>
</html>`;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getSummary() {
  const totalContributed = getTotalContributed();
  const yearStatus = computeYearStatus(totalContributed);
  return { totalContributed, totalRoom: TOTAL_ROOM, yearStatus };
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === "/" || path === "/index.html") {
      return new Response(HTML, { headers: { "Content-Type": "text/html" } });
    }

    if (path === "/bundle.js") {
      return new Response(Bun.file("./dist/main.js"));
    }

    if (path === "/api/summary" && req.method === "GET") {
      return json(getSummary());
    }

    if (path === "/api/contributions" && req.method === "GET") {
      return json(getAllContributions());
    }

    if (path === "/api/contributions" && req.method === "POST") {
      const body = (await req.json()) as {
        amount: number;
        date: string;
        note?: string;
      };
      if (!body.amount || body.amount <= 0) {
        return json({ error: "Invalid amount" }, 400);
      }
      if (!body.date) {
        return json({ error: "Date is required" }, 400);
      }
      addContribution(body.amount, body.date, body.note);
      return json(getSummary());
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`TFSA Countdown running at http://localhost:${server.port}`);
