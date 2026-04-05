import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SGM Sprint Manager',
  description: 'Gestão de sprints e backlog do time SGM',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
