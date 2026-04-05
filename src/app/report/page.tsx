'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import AppShell from '@/components/layout/AppShell'
import { Task, Sprint, TaskStatus } from '@/types'
import { StatusBadge, DevAvatar } from '@/components/ui/Badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FileText, AlertCircle, Save } from 'lucide-react'

const DEVS = ['Israel', 'João Vitor', 'Antonia'] as const
type Dev = typeof DEVS[number]

const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em andamento',
  FEITO: 'Feito',
  NAO_CONCLUIDA: 'Não concluída',
}

export default function ReportPage() {
  const supabase = createClient()
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [tab, setTab] = useState<'semanal' | 'final'>('semanal')
  const [generalObs, setGeneralObs] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: s } = await supabase.from('sprints').select('*').order('start_date', { ascending: false })
      const list = s ?? []
      setSprints(list)
      const active = list.find(x => x.status === 'ATIVA') ?? list[0] ?? null
      setSelectedSprint(active)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedSprint) return
    async function loadTasks() {
      const { data } = await supabase.from('tasks').select('*').eq('sprint_id', selectedSprint!.id).order('developer')
      setTasks(data ?? [])
      const { data: report } = await supabase.from('weekly_reports')
        .select('*').eq('sprint_id', selectedSprint!.id).order('created_at', { ascending: false }).limit(1)
      setGeneralObs(report?.[0]?.general_observations ?? '')
    }
    loadTasks()
  }, [selectedSprint])

  async function handleSaveObs() {
    if (!selectedSprint) return
    setSaving(true)
    const existing = await supabase.from('weekly_reports').select('id').eq('sprint_id', selectedSprint.id).limit(1)
    if (existing.data?.[0]) {
      await supabase.from('weekly_reports').update({ general_observations: generalObs }).eq('id', existing.data[0].id)
    } else {
      await supabase.from('weekly_reports').insert({
        sprint_id: selectedSprint.id,
        report_date: new Date().toISOString().split('T')[0],
        general_observations: generalObs,
      })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const devTasks = (dev: Dev) => tasks.filter(t => t.developer === dev)
  const devDone = (dev: Dev) => devTasks(dev).filter(t => t.status === 'FEITO').length
  const devPct = (dev: Dev) => {
    const total = devTasks(dev).length
    return total ? Math.round((devDone(dev) / total) * 100) : 0
  }

  const totalDone = tasks.filter(t => t.status === 'FEITO').length
  const totalPct = tasks.length ? Math.round((totalDone / tasks.length) * 100) : 0
  const totalReallocated = tasks.filter(t => t.status === 'NAO_CONCLUIDA').length
  const hasUnforeseen = tasks.filter(t => t.unforeseen && t.unforeseen.trim())

  if (loading) return <AppShell><div className="flex items-center justify-center h-64 text-gray-400 text-sm">Carregando...</div></AppShell>

  return (
    <AppShell>
      <div className="p-6 page-transition">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[18px] font-medium text-gray-900">Report semanal</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">Acompanhamento semanal do time</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={selectedSprint?.id ?? ''} onChange={e => setSelectedSprint(sprints.find(s => s.id === e.target.value) ?? null)}
              className="px-3 py-1.5 text-[12px] border border-black/10 rounded-lg bg-white text-gray-700">
              {sprints.map(s => (
                <option key={s.id} value={s.id}>Sprint {format(new Date(s.start_date), 'dd/MM', { locale: ptBR })} – {format(new Date(s.end_date), 'dd/MM/yy', { locale: ptBR })}</option>
              ))}
            </select>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] border border-black/10 rounded-lg bg-white text-gray-600 hover:bg-gray-50">
              <FileText size={13} /> Exportar PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-5">
          {(['semanal', 'final'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-[13px] border-b-2 transition-colors -mb-px ${tab === t ? 'border-[#534AB7] text-[#534AB7] font-medium' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {t === 'semanal' ? 'Report semanal' : 'Relatório final'}
            </button>
          ))}
        </div>

        {tab === 'semanal' && (
          <>
            {/* Summary */}
            <div className="bg-white rounded-xl border border-black/[0.06] p-4 mb-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[14px] font-medium text-gray-900">
                    Report — {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    {selectedSprint ? `Sprint ${format(new Date(selectedSprint.start_date), 'dd/MM', { locale: ptBR })} – ${format(new Date(selectedSprint.end_date), 'dd/MM/yyyy', { locale: ptBR })}` : '—'}
                  </p>
                </div>
                <span className={`text-[11px] px-3 py-1 rounded-full font-medium ${selectedSprint?.status === 'ATIVA' ? 'bg-[#EEEDFE] text-[#534AB7]' : 'bg-[#EAF3DE] text-[#3B6D11]'}`}>
                  {selectedSprint?.status === 'ATIVA' ? 'Em andamento' : 'Encerrada'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Tasks planejadas', value: tasks.length, color: 'text-gray-900' },
                  { label: 'Concluídas', value: totalDone, color: 'text-green-700' },
                  { label: 'Em andamento', value: tasks.filter(t => t.status === 'EM_ANDAMENTO').length, color: 'text-[#534AB7]' },
                ].map(m => (
                  <div key={m.label} className="text-center py-3 bg-gray-50 rounded-xl">
                    <p className={`text-[20px] font-medium ${m.color}`}>{m.value}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Per developer */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {DEVS.map(dev => {
                const dt = devTasks(dev)
                const done = dt.filter(t => t.status === 'FEITO')
                const inProgress = dt.filter(t => t.status === 'EM_ANDAMENTO')
                const pending = dt.filter(t => t.status === 'PENDENTE')
                const unforeseen = dt.filter(t => t.unforeseen && t.unforeseen.trim())
                if (dt.length === 0) return null
                return (
                  <div key={dev} className="bg-white rounded-xl border border-black/[0.06] overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <DevAvatar name={dev} />
                      <div>
                        <p className="text-[13px] font-medium text-gray-900">{dev}</p>
                        <p className="text-[11px] text-gray-400">{done.length} concluída{done.length !== 1 ? 's' : ''} · {inProgress.length} em andamento</p>
                      </div>
                      <div className="ml-auto text-[12px] font-medium text-[#534AB7]">{devPct(dev)}%</div>
                    </div>

                    {done.map(t => (
                      <div key={t.id} className="flex items-start gap-3 px-4 py-2.5 border-b border-gray-100 last:border-0">
                        <StatusBadge status="FEITO" />
                        <p className="text-[13px] text-gray-700 leading-snug">{t.title}</p>
                      </div>
                    ))}
                    {inProgress.map(t => (
                      <div key={t.id} className="flex items-start gap-3 px-4 py-2.5 border-b border-gray-100 last:border-0">
                        <StatusBadge status="EM_ANDAMENTO" />
                        <div>
                          <p className="text-[13px] text-gray-700 leading-snug">{t.title}</p>
                          {t.observations && <p className="text-[11px] text-gray-400 mt-0.5">{t.observations}</p>}
                        </div>
                      </div>
                    ))}
                    {pending.map(t => (
                      <div key={t.id} className="flex items-start gap-3 px-4 py-2.5 border-b border-gray-100 last:border-0">
                        <StatusBadge status="PENDENTE" />
                        <p className="text-[13px] text-gray-700 leading-snug">{t.title}</p>
                      </div>
                    ))}

                    <div className="flex items-start gap-2 px-4 py-2.5 bg-gray-50">
                      <AlertCircle size={13} className="text-gray-300 mt-0.5 shrink-0" />
                      <p className="text-[12px] text-gray-400">
                        <span className="font-medium text-gray-600">Imprevistos: </span>
                        {unforeseen.length === 0 ? 'Nenhum' : unforeseen.map(t => t.unforeseen).join('; ')}
                      </p>
                    </div>
                  </div>
                )
              })}

              {/* General observations */}
              <div className="bg-white rounded-xl border border-black/[0.06] p-4">
                <p className="text-[13px] font-medium text-gray-900 mb-3">Observações gerais da semana</p>
                <textarea value={generalObs} onChange={e => setGeneralObs(e.target.value)} rows={5}
                  placeholder="Adicione observações gerais sobre o andamento da sprint, bloqueios, alinhamentos..."
                  className="w-full px-3 py-2 text-[13px] border border-black/10 rounded-lg bg-white text-gray-900 resize-none outline-none focus:border-[#534AB7] placeholder:text-gray-300" />
                <div className="flex justify-end mt-3">
                  <button onClick={handleSaveObs} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#534AB7] text-white rounded-lg text-[13px] font-medium hover:bg-[#3C3489] transition-colors disabled:opacity-50">
                    <Save size={13} />
                    {saved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar observações'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'final' && (
          <>
            <div className="bg-white rounded-xl border border-black/[0.06] p-4 mb-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[14px] font-medium text-gray-900">Relatório final</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">{tasks.length} tasks planejadas</p>
                </div>
                <span className="text-[11px] px-3 py-1 rounded-full font-medium bg-[#EAF3DE] text-[#3B6D11]">Encerrada</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center py-3 bg-gray-50 rounded-xl">
                  <p className="text-[20px] font-medium text-green-700">{totalDone}</p>
                  <p className="text-[11px] text-gray-400 mt-1">Concluídas</p>
                </div>
                <div className="text-center py-3 bg-gray-50 rounded-xl">
                  <p className="text-[20px] font-medium text-red-600">{totalReallocated}</p>
                  <p className="text-[11px] text-gray-400 mt-1">Realocadas</p>
                </div>
                <div className="text-center py-3 bg-gray-50 rounded-xl">
                  <p className="text-[20px] font-medium text-[#534AB7]">{totalPct}%</p>
                  <p className="text-[11px] text-gray-400 mt-1">% de conclusão</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-black/[0.06] overflow-hidden mb-4">
              <p className="text-[13px] font-medium text-gray-900 px-4 py-3 border-b border-gray-100">Métricas por desenvolvedor</p>
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">Desenvolvedor</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">Planejadas</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">Concluídas</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">Realocadas</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">% conclusão</th>
                  </tr>
                </thead>
                <tbody>
                  {DEVS.map(dev => {
                    const dt = devTasks(dev)
                    if (dt.length === 0) return null
                    const done = dt.filter(t => t.status === 'FEITO').length
                    const realloc = dt.filter(t => t.status === 'NAO_CONCLUIDA').length
                    const pct = dt.length ? Math.round((done / dt.length) * 100) : 0
                    return (
                      <tr key={dev} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2"><DevAvatar name={dev} />{dev}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{dt.length}</td>
                        <td className="px-4 py-3 text-green-700 font-medium">{done}</td>
                        <td className="px-4 py-3 text-red-600">{realloc}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#534AB7] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className={`font-medium ${pct >= 80 ? 'text-green-700' : pct >= 60 ? 'text-amber-700' : 'text-red-600'}`}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {hasUnforeseen.length > 0 && (
              <div className="bg-white rounded-xl border border-black/[0.06] p-4">
                <p className="text-[13px] font-medium text-gray-900 mb-3">Imprevistos registrados</p>
                {hasUnforeseen.map(t => (
                  <div key={t.id} className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
                    <AlertCircle size={13} className="text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[13px] text-gray-900">{t.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{t.unforeseen}</p>
                    </div>
                    {t.developer && <DevAvatar name={t.developer} />}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
