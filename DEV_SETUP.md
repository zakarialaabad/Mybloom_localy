# Dev Setup — Local & Network Access

## Your current IPs
| Access | URL |
|---|---|
| **Local (this PC)** | `http://localhost:3000` |
| **Network (Wi-Fi — phone / tablet)** | `http://192.168.1.41:3000` |

> ⚠️ If your Wi-Fi IP changes, update it in:
> - `frontend/.env.network` → all `192.168.1.41` occurrences
> - `backend/.env` → `FRONTEND_NETWORK_URL`
>
> Check your current IP with:
> ```powershell
> Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" }
> ```

---

## 1 — Start the Backend (Laravel)

Open a terminal at `backend/` and run:

```bash
# Normal (localhost only)
php artisan serve --port=8000

# Network mode (accessible from phone / other PC on the same Wi-Fi)
php artisan serve --host=0.0.0.0 --port=8000
```

API is available at:
- `http://localhost:8000/api`
- `http://192.168.1.41:8000/api` ← from any device on Wi-Fi

---

## 2 — Start the Frontend (Next.js)

Open a **separate** terminal at `frontend/` and run:

```bash
# Normal dev (localhost only)
npm run dev

# Network mode (accessible from phone / other PC on the same Wi-Fi)
npm run dev:network
```

Site is available at:
- `http://localhost:3000`
- `http://192.168.1.41:3000` ← from any device on Wi-Fi

---

## How it works

| Script | Env file loaded | Host binding |
|---|---|---|
| `npm run dev` | `.env.local` | `localhost` only |
| `npm run dev:network` | `.env.network` | `0.0.0.0` (all interfaces) |

The backend CORS config (`backend/config/cors.php`) reads `FRONTEND_URL` and `FRONTEND_NETWORK_URL` from `backend/.env` and allows both origins automatically.

---

## Quick start (Network mode — both servers)

**Terminal 1 — backend:**
```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8000
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm run dev:network
```

Then open `http://192.168.1.41:3000` on any device connected to the same Wi-Fi.
