'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import AppShell from '@/components/layout/AppShell'
import { Task, TaskType, TaskStatus, Priority } from '@/types'
import { TypeBadge, StatusBadge, PriorityLabel, DevAvatar } from '@/components/ui/Badge'
import { Search, Plus, Pencil, Trash2 } from 'lucide-react'

const MODULES = ['Intranet', '5s', 'Auditoria', 'Aprovação', 'Avaliação', 'Documentação', 'Certificação', 'Outro']

function TaskModal({ task, onClose, onSave }: {
  task: Partial<Task> | null
  onClose: () => void
  onSave: (t: Partial<Task>) => void
}) {
  const [form, setForm] = useState<Partial<Task>>(task ?? { type: 'NEW', priority: 'MEDIA', status: 'PENDENTE', is_backlog: true })
  const set = (k: keyof Task, v: unknown) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-black/[0.08] p-6 w-[520px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-[15px] font-medium text-gray-900 mb-5">{task?.id ? 'Editar task' : 'Nova task'}</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[12px] text-gray-500 mb-1 block">Título</label>
            <input value={form.title ?? ''} onChange={e => set('title', e.target.value)}
              className="w-full px-3 py-2 text-[13px] border border-black/10 rounded-lg bg-white text-gray-900 outline-none focus:border-[#534AB7]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] text-gray-500 mb-1 block">Tipo</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full px-3 py-2 text-[13px] border border-black/10 rounded-lg bg-white text-gray-900">
                {(['NEW','BUG','ATT','EXTRA'] as TaskType[]).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12px] text-gray-500 mb-1 block">Prioridade</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}
                className="w-full px-3 py-2 text-[13px] border border-black/10 rounded-lg bg-white text-gray-900">
                {(['URGENTE','ALTA','MEDIA','BAIXA'] as Priority[]).map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] text-gray-500 mb-1 block">Módulo</label>
              <select value={form.module ?? ''} onChange={e => set('module', e.target.value)}
                className="w-full px-3 py-2 text-[13px] border border-black/10 rounded-lg bg-white text-gray-900">
                <option value="">— selecione —</option>
                {MODULES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12px] text-gray-500 mb-1 block">Desenvolvedor</label>
              <select value={form.developer ?? ''} onChange={e => set('developer', e.target.value)}
                className="w-full px-3 py-2 text-[13px] border border-black/10 rounded-lg bg-white text-gray-900">
                <option value="">— selecione —</option>
                <option>Israel</option>
                <option>João Vitor</option>
                <option>Antonia</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[12px] text-gray-500 mb-1 block">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full px-3 py-2 text-[13px] border border-black/10 rounded-lg bg-white text-gray-900">
              {(['PENDENTE','EM_ANDAMENTO','FEITO','NAO_CONCLUIDA'] as TaskStatus[]).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[12px] text-gray-500 mb-1 block">Observações</label>
            <textarea value={form.observations ?? ''} onChange={e => set('observations', e.target.value)} rows={2}
              className="w-full px-3 py-2 text-[13px] border border-black/10 rounded-lg bg-white text-gray-900 resize-none outline-none focus:border-[#534AB7]" />
          </div>
          <div>
            <label className="text-[12px] text-gray-500 mb-1 block">Imprevistos</label>
            <textarea value={form.unforeseen ?? ''} onChange={e => set('unforeseen', e.target.value)} rows={2}
              className="w-full px-3 py-2 text-[13px] border border-black/10 rounded-lg bg-white text-gray-900 resize-none outline-none focus:border-[#534AB7]" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-[13px] border border-black/10 rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={() => onSave(form)} className="px-4 py-2 text-[13px] bg-[#534AB7] text-white rounded-lg hover:bg-[#3C3489]">Salvar</button>
        </div>
      </div>
    </div>
  )
}

export default function BacklogPage() {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [moduleFilter, setModuleFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [modal, setModal] = useState<Partial<Task> | null | undefined>(undefined)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase.from('tasks').select('*').eq('is_backlog', true).order('created_at', { ascending: false })
    setTasks(data ?? [])
    setLoading(false)
  }

  async function handleSave(form: Partial<Task>) {
    if (form.id) {
      await supabase.from('tasks').update({ ...form, updated_at: new Date().toISOString() }).eq('id', form.id)
    } else {
      await supabase.from('tasks').insert({ ...form, is_backlog: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    }
    setModal(undefined)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta task?')) return
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(p => p.filter(t => t.id !== id))
  }

  const filtered = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && t.status !== statusFilter) return false
    if (moduleFilter && t.module !== moduleFilter) return false
    if (priorityFilter && t.priority !== priorityFilter) return false
    return true
  })

  return (
    <AppShell>
      {modal !== undefined && (
        <TaskModal task={modal} onClose={() => setModal(undefined)} onSave={handleSave} />
      )}
      <div className="p-6 page-transition">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[18px] font-medium text-gray-900">Backlog geral</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">{filtered.length} itens</p>
          </div>
          <button onClick={() => setModal(null)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#534AB7] text-[#EEEDFE] rounded-lg text-[13px] font-medium hover:bg-[#3C3489] transition-colors">
            <Plus size={14} /> Nova task
          </button>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-white border border-black/10 rounded-lg px-3 py-1.5">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar atividade..."
              className="flex-1 text-[13px] text-gray-900 bg-transparent outline-none placeholder:text-gray-400" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-[12px] border border-black/10 rounded-lg bg-white text-gray-700">
            <option value="">Todos os status</option>
            <option value="PENDENTE">Pendente</option>
            <option value="EM_ANDAMENTO">Em andamento</option>
            <option value="FEITO">Feito</option>
          </select>
          <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}
            className="px-3 py-1.5 text-[12px] border border-black/10 rounded-lg bg-white text-gray-700">
            <option value="">Todos os módulos</option>
            {MODULES.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-[12px] border border-black/10 rounded-lg bg-white text-gray-700">
            <option value="">Todas as prioridades</option>
            <option value="URGENTE">Urgente</option>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Média</option>
            <option value="BAIXA">Baixa</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border border-black/[0.06] overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-[13px] text-gray-400">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-[13px] text-gray-400">Nenhuma task encontrada</div>
          ) : (
            <table className="w-full border-collapse text-[13px]" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '38%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '15%' }} />
              </colgroup>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Atividade', 'Módulo', 'Tipo', 'Prioridade', 'Status', 'Ações'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={t.id} className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {t.developer && <DevAvatar name={t.developer} />}
                        <span className="text-gray-900 leading-snug">{t.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{t.module ?? '—'}</td>
                    <td className="px-4 py-3"><TypeBadge type={t.type} /></td>
                    <td className="px-4 py-3"><PriorityLabel priority={t.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal(t)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(t.id)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppShell>
  )
}
