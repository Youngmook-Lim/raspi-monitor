import { useStats } from './hooks/useStats'
import { useTheme } from './hooks/useTheme'
import { Header } from './components/Header'
import { CpuCard } from './components/CpuCard'
import { TempCard } from './components/TempCard'
import { RamCard } from './components/RamCard'
import { NetCard } from './components/NetCard'
import { DiskCard } from './components/DiskCard'
import { LoadCard } from './components/LoadCard'
import { ProcsCard } from './components/ProcsCard'
import { ModelCard } from './components/ModelCard'
import { MatrixCard } from './components/MatrixCard'
import { WaveformCard } from './components/WaveformCard'

export default function App() {
  const { data, history, live } = useStats()
  const [theme, toggleTheme] = useTheme()

  return (
    <>
      <div className="scanlines" />
      <div className="vignette" />
      <div className="grid">
        <Header data={data} live={live} theme={theme} onToggleTheme={toggleTheme} />
        <CpuCard data={data} history={history} />
        <TempCard data={data} />
        <RamCard data={data} />
        <NetCard data={data} history={history} />
        <DiskCard data={data} />
        <LoadCard data={data} />
        <ProcsCard data={data} />
        <ModelCard data={data} />
        <MatrixCard />
        <WaveformCard data={data} />
      </div>
    </>
  )
}
