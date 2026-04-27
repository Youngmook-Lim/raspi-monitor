# RPi Monitor

Real-time Raspberry Pi system dashboard. Hyprland/CLI aesthetic — deep purple palette, CRT scanlines, bento grid, canvas animations.

## Structure

```
raspi-monitor/
├── frontend/          Vite + React 19 + TypeScript
└── server/            Python Flask + psutil API
```

## Commands

### Frontend
```bash
cd frontend
npm install          # install deps
npm run dev          # dev server at localhost:5173 (or next available port)
npm run build        # production build → dist/
npm run lint         # eslint
npx tsc --noEmit     # type check only
```

### Backend
```bash
cd server
pip install flask flask-cors psutil
python3 server.py    # runs at 0.0.0.0:5000
```

## Architecture

**Data flow:** `EventSource('/api/stream')` → Flask SSE pushes JSON every 2s → React state. On connection error, falls back automatically to simulated random-walk data. The `live` boolean in the header reflects which source is active.

**Dev proxy:** Vite proxies `/api/*` → `http://localhost:5000` (configured in `frontend/vite.config.ts`). In production, point to `http://<pi-ip>:5000`.

**Theme:** CSS custom properties on `:root` for dark, `:root[data-theme="light"]` for light. `useTheme` sets `document.documentElement.dataset.theme` and persists to `localStorage`. Scanlines/vignette overlays use `--scanline-opacity`/`--vignette-opacity` vars so they disappear in light mode automatically.

## Key files

| File | Purpose |
|---|---|
| `frontend/src/hooks/useStats.ts` | SSE connection, simulate fallback, 60-entry history ring buffer |
| `frontend/src/hooks/useTheme.ts` | Dark/light toggle + localStorage persistence |
| `frontend/src/styles/global.css` | All CSS vars (both themes), grid areas, card/bar/table styles |
| `frontend/src/types.ts` | `StatsPayload` interface — must match server JSON shape |
| `server/server.py` | `build_stats()` helper, `GET /api/stats` (one-shot), `GET /api/stream` (SSE) |

## Dashboard cards

11 cards in a 4-col bento grid (→ 2-col tablet, 1-col mobile):

| Grid area | Card | Notes |
|---|---|---|
| `hdr` | Header | Hostname, live/simulated badge, clock, uptime, theme toggle |
| `cpu` | CPU | Ring gauge + per-core bars + 60s interactive history sparkline (hover to inspect) |
| `tmp` | Temperature | Arc gauge with NOMINAL/WARM/HOT zones (52°C / 68°C thresholds) |
| `ram` | Memory | RAM + swap bars, free/total pills |
| `net` | Network | Dual RX/TX sparklines |
| `dsk` | Disk | Ring gauge + read/write bps pills |
| `lod` | Load average | 1m/5m/15m with mini bars |
| `prc` | Top processes | Table sorted by CPU%, 8 rows |
| `mdl` | System info | Model, OS, kernel, SSE endpoint |
| `mtr` | Entropy stream | Matrix rain canvas (decorative) |
| `wfm` | Waveform | Oscilloscope canvas, amplitude driven by live CPU + network |

## Color thresholds

CPU/disk/process usage and temperature colors change at runtime:
- `cpuColHex(p)`: purple → pink at 50%, red at 80%
- `tempColHex(t)`: purple → pink at 52°C, red at 68°C
- Load average: purple → pink at 1.2, red at 2.5

## API shape (`/api/stats` and SSE frames)

```json
{
  "hostname": "RPi-YML",
  "model": "Raspberry Pi 4 Model B Rev 1.4",
  "os": "...", "kernel": "...", "uptime": 12345,
  "cpu":     { "total": 41.2, "cores": [38,55,28,47], "temp": 51.2, "freq": 1500, "governor": "ondemand" },
  "memory":  { "total": 8589934592, "used": 3327303475, "swap_total": 2147483648, "swap_used": 440401920 },
  "disk":    { "total": 34359738368, "used": 19751862149, "read_bps": 47104, "write_bps": 13312 },
  "network": { "rx_bps": 268288, "tx_bps": 86016, "iface": "eth0" },
  "processes": [{ "pid": 1821, "name": "node", "cpu": 12.3, "mem": 4.2 }],
  "load": [1.18, 0.92, 0.71]
}
```

## Deploying to Pi

1. Copy `server/server.py` to the Pi, install deps, run it.
2. Build the frontend (`npm run build`), serve `dist/` from Flask or Nginx.
3. For Flask to serve static files, add to `server.py`:
   ```python
   from flask import send_from_directory
   @app.route('/', defaults={'path': ''})
   @app.route('/<path:path>')
   def serve(path):
       if path and (Path('dist') / path).exists():
           return send_from_directory('dist', path)
       return send_from_directory('dist', 'index.html')
   ```
4. For systemd auto-start, see the commented snippet at the bottom of `server.py`.
