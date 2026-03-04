# TFSA Countdown

A personal dashboard for filling your unused TFSA contribution room. Enter contributions as you make them and watch the years tick off — oldest first, working toward fully maxing out your account.

**Two ways to use it:**

- **GitHub Pages** — runs entirely in your browser with no server needed. Data lives in localStorage. [Try it here.](https://selesse.github.io/tfsa-countdown/)
- **Self-hosted** — Bun server + SQLite, good for a shared household dashboard running on a home server or VPS.

---

## Self-hosted setup

**Requirements:** [Bun](https://bun.sh)

```bash
bun install
bun run dev        # http://localhost:3000
```

### Deploying

Copy `.env.example` to `.env` and fill it in:

```bash
# .env
DEPLOY_HOST=user@your-server.example.com
DEPLOY_PATH=/home/user/git/tfsa-countdown
PORT=3000
```

Then deploy:

```bash
script/deploy
```

This rsyncs the project, installs dependencies, and restarts the systemd user service on the remote host. The service file (`tfsa-countdown.service`) is installed automatically on first deploy.
