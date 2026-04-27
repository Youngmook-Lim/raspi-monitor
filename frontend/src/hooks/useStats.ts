import { useState, useEffect, useRef } from 'react'
import type { StatsPayload } from '../types'
import { clamp, rw } from '../utils/colors'

const HIST_LEN = 60

const INIT: StatsPayload = {
  hostname: 'RPi-YML',
  model: 'Raspberry Pi 4 Model B Rev 1.4',
  os: 'Raspberry Pi OS 12 (Bookworm)',
  kernel: '6.6.31+rpt-rpi-v8',
  uptime: 3 * 86400 + 7 * 3600 + 42 * 60,
  cpu: { total: 41, cores: [38, 55, 28, 47], temp: 51.2, freq: 1500, governor: 'ondemand' },
  memory: {
    total: 8 * 1024 ** 3,
    used: 3.1 * 1024 ** 3,
    swap_total: 2 * 1024 ** 3,
    swap_used: 420 * 1024 ** 2,
  },
  disk: { total: 32 * 1024 ** 3, used: 18.4 * 1024 ** 3, read_bps: 46 * 1024, write_bps: 13 * 1024 },
  network: { rx_bps: 262 * 1024, tx_bps: 84 * 1024, iface: 'eth0' },
  processes: [
    { name: 'node',         pid: 1821, cpu: 12.3, mem: 4.2 },
    { name: 'python3',      pid: 5503, cpu: 8.1,  mem: 2.8 },
    { name: 'influxdb',     pid: 2204, cpu: 5.2,  mem: 8.4 },
    { name: 'mosquitto',    pid:  910, cpu: 2.3,  mem: 0.5 },
    { name: 'grafana',      pid: 3107, cpu: 1.1,  mem: 6.3 },
    { name: 'nginx',        pid: 1314, cpu: 0.4,  mem: 1.2 },
    { name: 'sshd',         pid: 1112, cpu: 0.8,  mem: 0.3 },
    { name: 'avahi-daemon', pid: 1920, cpu: 0.0,  mem: 0.1 },
  ],
  load: [1.18, 0.92, 0.71],
}

function simulate(prev: StatsPayload): StatsPayload {
  const cores = prev.cpu.cores.map(c => rw(c, 2, 97, 7))
  return {
    ...prev,
    uptime: prev.uptime + 2,
    cpu: {
      ...prev.cpu,
      total: cores.reduce((a, b) => a + b, 0) / cores.length,
      cores,
      temp: rw(prev.cpu.temp, 38, 82, 1.8),
      freq: Math.round(rw(prev.cpu.freq, 600, 1800, 100)),
    },
    memory: {
      ...prev.memory,
      used: rw(prev.memory.used, prev.memory.total * 0.15, prev.memory.total * 0.88, 60 * 1024 ** 2),
      swap_used: rw(prev.memory.swap_used, 0, prev.memory.swap_total * 0.6, 20 * 1024 ** 2),
    },
    disk: {
      ...prev.disk,
      read_bps: rw(prev.disk.read_bps, 0, 520 * 1024, 35 * 1024),
      write_bps: rw(prev.disk.write_bps, 0, 200 * 1024, 18 * 1024),
    },
    network: {
      ...prev.network,
      rx_bps: rw(prev.network.rx_bps, 0, 4 * 1024 ** 2, 90 * 1024),
      tx_bps: rw(prev.network.tx_bps, 0, 2 * 1024 ** 2, 45 * 1024),
    },
    processes: prev.processes.map(p => ({
      ...p,
      cpu: clamp(p.cpu + (Math.random() - 0.5) * 3, 0, 45),
    })),
    load: prev.load.map(l => clamp(l + (Math.random() - 0.5) * 0.22, 0.01, 4.5)) as [number, number, number],
  }
}

export function useStats() {
  const [data, setData] = useState<StatsPayload>(INIT)
  const [history, setHistory] = useState<StatsPayload[]>(Array(HIST_LEN).fill(INIT))
  const [live, setLive] = useState(false)
  const dataRef = useRef<StatsPayload>(INIT)

  useEffect(() => {
    let es: EventSource | null = null
    let simTimer: ReturnType<typeof setInterval> | null = null

    const startSim = () => {
      if (simTimer) return
      simTimer = setInterval(() => {
        const next = simulate(dataRef.current)
        dataRef.current = next
        setData(next)
        setHistory(h => [...h.slice(1), next])
      }, 2000)
    }

    const stopSim = () => {
      if (simTimer) { clearInterval(simTimer); simTimer = null }
    }

    const connect = () => {
      es = new EventSource('/api/stream')

      es.onmessage = (e) => {
        try {
          const next: StatsPayload = JSON.parse(e.data)
          stopSim()
          setLive(true)
          dataRef.current = next
          setData(next)
          setHistory(h => [...h.slice(1), next])
        } catch {
          // ignore malformed frames
        }
      }

      es.onerror = () => {
        setLive(false)
        startSim()
        // EventSource will auto-reconnect; no need to close/reopen
      }
    }

    connect()

    return () => {
      es?.close()
      stopSim()
    }
  }, [])

  return { data, history, live }
}
