#!/usr/bin/env python3
"""
RPi-YML System Monitor — API Server
────────────────────────────────────
Install:  pip install flask flask-cors psutil
Run:      python3 server.py
Dashboard runs at: http://localhost:5173 (dev) or served from frontend/dist/

systemd service snippet at bottom of file.
"""

from flask import Flask, jsonify, Response, stream_with_context
from flask_cors import CORS
import psutil, platform, socket, time, os, json

app = Flask(__name__)
CORS(app)

# ── I/O rate tracking ────────────────────────────────────────────────────────
_prev_net  = psutil.net_io_counters()
_prev_disk = psutil.disk_io_counters()
_prev_time = time.monotonic()


def _rates():
    global _prev_net, _prev_disk, _prev_time
    now_net  = psutil.net_io_counters()
    now_disk = psutil.disk_io_counters()
    now_time = time.monotonic()
    dt = max(now_time - _prev_time, 0.001)

    rx = (now_net.bytes_recv  - _prev_net.bytes_recv)  / dt
    tx = (now_net.bytes_sent  - _prev_net.bytes_sent)  / dt
    rd = (now_disk.read_bytes  - _prev_disk.read_bytes)  / dt
    wr = (now_disk.write_bytes - _prev_disk.write_bytes) / dt

    _prev_net  = now_net
    _prev_disk = now_disk
    _prev_time = now_time
    return max(rx, 0), max(tx, 0), max(rd, 0), max(wr, 0)


# ── Helpers ───────────────────────────────────────────────────────────────────
def cpu_temp():
    try:
        with open('/sys/class/thermal/thermal_zone0/temp') as f:
            return round(int(f.read().strip()) / 1000, 1)
    except Exception:
        pass
    temps = psutil.sensors_temperatures() or {}
    for entries in temps.values():
        if entries:
            return round(entries[0].current, 1)
    return 0.0


def pi_model():
    try:
        with open('/proc/device-tree/model', 'rb') as f:
            return f.read().decode('utf-8', errors='replace').rstrip('\x00').strip()
    except Exception:
        return platform.machine()


def cpu_governor():
    try:
        with open('/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor') as f:
            return f.read().strip()
    except Exception:
        return 'unknown'


def active_iface():
    for name, s in psutil.net_if_stats().items():
        if name != 'lo' and s.isup:
            return name
    return 'eth0'


def top_processes(n=8):
    procs = []
    for p in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
        try:
            procs.append({
                'pid':  p.info['pid'],
                'name': (p.info['name'] or '')[:22],
                'cpu':  round(p.info['cpu_percent'] or 0.0, 1),
                'mem':  round(p.info['memory_percent'] or 0.0, 1),
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    procs.sort(key=lambda x: x['cpu'], reverse=True)
    return procs[:n]


def build_stats():
    rx_bps, tx_bps, rd_bps, wr_bps = _rates()
    cpu_pct   = psutil.cpu_percent(interval=0.1)
    cpu_cores = psutil.cpu_percent(interval=0.1, percpu=True)
    cpu_freq  = psutil.cpu_freq()
    mem       = psutil.virtual_memory()
    swap      = psutil.swap_memory()
    disk      = psutil.disk_usage('/')
    load      = [round(x, 2) for x in os.getloadavg()]

    return {
        'hostname': socket.gethostname(),
        'model':    pi_model(),
        'os':       f"{platform.system()} {platform.version()[:50]}",
        'kernel':   platform.release(),
        'uptime':   int(time.time() - psutil.boot_time()),

        'cpu': {
            'total':    round(cpu_pct, 1),
            'cores':    [round(c, 1) for c in cpu_cores],
            'temp':     cpu_temp(),
            'freq':     int(cpu_freq.current) if cpu_freq else 0,
            'governor': cpu_governor(),
        },

        'memory': {
            'total':      mem.total,
            'used':       mem.used,
            'swap_total': swap.total,
            'swap_used':  swap.used,
        },

        'disk': {
            'total':     disk.total,
            'used':      disk.used,
            'read_bps':  round(rd_bps),
            'write_bps': round(wr_bps),
        },

        'network': {
            'rx_bps': round(rx_bps),
            'tx_bps': round(tx_bps),
            'iface':  active_iface(),
        },

        'processes': top_processes(),
        'load':      load,
    }


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route('/api/stats')
def stats():
    """One-shot JSON endpoint — useful for curl health checks."""
    return jsonify(build_stats())


@app.route('/api/stream')
def stream():
    """Server-Sent Events stream — pushes a stats payload every 2 seconds."""
    def generate():
        while True:
            payload = build_stats()
            yield f"data: {json.dumps(payload)}\n\n"
            time.sleep(2)

    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control':    'no-cache',
            'X-Accel-Buffering': 'no',      # disable Nginx proxy buffering
        },
    )


# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("─" * 52)
    print("  RPi Monitor API server")
    print("  http://0.0.0.0:5000/api/stats   (one-shot)")
    print("  http://0.0.0.0:5000/api/stream  (SSE)")
    print("─" * 52)
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)


# ── systemd service (optional) ────────────────────────────────────────────────
# Save as /etc/systemd/system/rpi-monitor.service then:
#   sudo systemctl enable --now rpi-monitor
#
# [Unit]
# Description=RPi Monitor API
# After=network.target
#
# [Service]
# ExecStart=/usr/bin/python3 /home/pi/rpi-monitor/server/server.py
# WorkingDirectory=/home/pi/rpi-monitor/server
# Restart=always
# User=pi
#
# [Install]
# WantedBy=multi-user.target
