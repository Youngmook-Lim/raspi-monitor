export interface CpuStats {
  total: number
  cores: number[]
  temp: number
  freq: number
  governor: string
}

export interface MemoryStats {
  total: number
  used: number
  swap_total: number
  swap_used: number
}

export interface DiskStats {
  total: number
  used: number
  read_bps: number
  write_bps: number
}

export interface NetworkStats {
  rx_bps: number
  tx_bps: number
  iface: string
}

export interface Process {
  pid: number
  name: string
  cpu: number
  mem: number
}

export interface StatsPayload {
  hostname: string
  model: string
  os: string
  kernel: string
  uptime: number
  cpu: CpuStats
  memory: MemoryStats
  disk: DiskStats
  network: NetworkStats
  processes: Process[]
  load: [number, number, number]
}
