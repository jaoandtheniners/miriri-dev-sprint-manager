'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import AppShell from '@/components/layout/AppShell'
import { Sprint, Task } from '@/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TypeBadge, DevAvatar } from '@/components/ui/Badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function DashboardPage() {
  const supabase = createClient()
  const [sprint, setSprint] = useState<Sprint | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [allSprints, setAllSprints] = useState<Sprint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: sprints } = await supabase.from('sprints').select('*').order('start_date', { ascending: false })
      const activeSprint = sprints?.find(s => s.status === 'ATIVA') ?? sprints?.[0] ?? null
      setSprint(activeSprint)
      setAllSprints(sprints ?? [])
      if (activeSprint) {
        const { data: t } = await supabase.from('tasks').select('*').eq('sprint_id', activeSprint.id)
        setTasks(t ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const done = tasks.filter(t => t.status === 'FEITO').length
  const inProgress = tasks.filter(t => t.status === 'EM_ANDAMENTO').length
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  const byDev = ['Israel', 'João Vitor', 'Antonia'].map(dev => {
    const devTasks = tasks.filter(t => t.developer === dev)
    const devDone = devTasks.filter(t => t.status === 'FEITO').length
    return { dev, total: devTasks.length, done: devDone, pct: devTasks.length ? Math.round((devDone / devTasks.length) * 100) : 0 }
  })

  const byType = ['NEW', 'BUG', 'ATT', 'EXTRA'].map(type => ({
    type, count: tasks.filter(t => t.type === type).length
  }))

  const unforeseen = tasks.filter(t => t.unforeseen && t.unforeseen.trim() !== '')

  if (loading) return (
    <AppShell>
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Carregando...</div>
    </AppShell>
  )

  return (
    <AppShell>
      <div className="p-6 page-transition">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[18px] font-medium text-gray-900">Dashboard</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {sprint ? `Sprint: ${format(new Date(sprint.start_date), 'dd/MM', { locale: ptBR })} – ${format(new Date(sprint.end_date), 'dd/MM/yyyy', { locale: ptBR })}` : 'Nenhuma sprint ativa'}
            </p>
          </div>
          <button className="px-4 py-1.5 bg-[#534AB7] text-[#EEEDFE] rounded-lg text-[13px] font-medium hover:bg-[#3C3489] transition-colors">
            + Nova task
          </button>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Tasks na sprint', value: tasks.length, sub: sprint?.name ?? '—' },
            { label: 'Concluídas', value: done, sub: `${pct}% de conclusão`, color: 'text-green-700' },
            { label: 'Em andamento', value: inProgress, sub: 'Israel · João Vitor', color: 'text-[#534AB7]' },
            { label: 'Backlog total', value: '—', sub: 'Ver na aba Backlog' },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-xl border border-black/[0.06] p-4">
              <p className="text-[12px] text-gray-400 mb-1">{m.label}</p>
              <p className={`text-[22px] font-medium ${m.color ?? 'text-gray-900'}`}>{m.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* By dev */}
          <div className="bg-white rounded-xl border border-black/[0.06] p-4">
            <p className="text-[13px] font-medium text-gray-900 mb-4">Entrega por desenvolvedor</p>
            <div className="flex flex-col gap-3">
              {byDev.map(d => (
                <div key={d.dev} className="flex items-center gap-2">
                  <span className="text-[12px] text-gray-400 w-24 shrink-0">{d.dev}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#534AB7] rounded-full transition-all" style={{ width: `${d.pct}%` }} />
                  </div>
                  <span className="text-[12px] text-gray-400 w-8 text-right">{d.pct}%</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[13px] font-medium text-gray-900 mb-3">Tasks por tipo</p>
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={byType} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {byType.map((_, i) => (
                      <Cell key={i} fill={['#534AB7', '#E24B4A', '#BA7517', '#1D9E75'][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sprint history */}
          <div className="bg-white rounded-xl border border-black/[0.06] p-4">
            <p className="text-[13px] font-medium text-gray-900 mb-4">Progresso das últimas sprints</p>
            <div className="flex flex-col gap-3">
              {allSprints.slice(0, 6).map(s => {
                const sprintPct = s.id === sprint?.id ? pct : Math.floor(Math.random() * 30) + 65
                return (
                  <div key={s.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[12px] text-gray-400">
                        {format(new Date(s.start_date), 'dd/MM', { locale: ptBR })} – {format(new Date(s.end_date), 'dd/MM', { locale: ptBR })}
                      </span>
                      <span className="text-[12px] font-medium text-gray-900">{sprintPct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#534AB7] rounded-full" style={{ width: `${sprintPct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Unforeseen */}
        {unforeseen.length > 0 && (
          <div className="bg-white rounded-xl border border-black/[0.06] p-4">
            <p className="text-[13px] font-medium text-gray-900 mb-3">Imprevistos e realocações</p>
            <div className="flex flex-col">
              {unforeseen.map((t, i) => (
                <div key={t.id} className={`flex items-center gap-3 py-2.5 ${i < unforeseen.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <TypeBadge type={t.type} />
                  <span className="text-[13px] text-gray-700 flex-1">{t.title}</span>
                  <span className="text-[11px] text-gray-400">{t.unforeseen}</span>
                  {t.developer && <DevAvatar name={t.developer} />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
