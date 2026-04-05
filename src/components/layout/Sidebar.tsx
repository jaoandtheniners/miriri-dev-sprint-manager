'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Kanban, List, FileText, Clock } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kanban',    label: 'Kanban',     icon: Kanban },
  { href: '/backlog',   label: 'Backlog geral', icon: List },
  { href: '/report',   label: 'Report semanal', icon: FileText },
  { href: '/historico', label: 'Histórico',  icon: Clock },
]

const DEVS = [
  { initials: 'IS', name: 'Israel',     color: 'bg-[#EEEDFE] text-[#534AB7]' },
  { initials: 'JV', name: 'João Vitor', color: 'bg-[#E1F5EE] text-[#0F6E56]' },
  { initials: 'AN', name: 'Antonia',    color: 'bg-[#FAEEDA] text-[#633806]' },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside className="w-[200px] min-w-[200px] h-screen flex flex-col bg-[#F0EFE9] border-r border-black/[0.08] p-3 sticky top-0">
      <div className="px-2 pb-5 pt-2">
        <p className="text-[15px] font-medium text-gray-900">SGM Sprint</p>
        <p className="text-[11px] text-gray-400 mt-0.5">Sistema de gestão</p>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={clsx(
              'flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] transition-colors',
              path === href
                ? 'bg-white text-gray-900 font-medium border border-black/[0.08]'
                : 'text-gray-500 hover:bg-white/60'
            )}>
            <Icon size={14} className="opacity-60 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-4">
        <p className="px-2.5 text-[11px] text-gray-400 uppercase tracking-wider mb-1">Time</p>
        {DEVS.map(d => (
          <div key={d.name} className="flex items-center gap-2 px-2.5 py-1.5 text-[13px] text-gray-400">
            <div className={clsx('w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium', d.color)}>
              {d.initials}
            </div>
            {d.name}
          </div>
        ))}
      </div>
    </aside>
  )
}
