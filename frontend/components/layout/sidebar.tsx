'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Brain,
  FileText,
  LayoutDashboard,
  WalletCards,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transaction', icon: WalletCards },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/ai-chat', label: 'AI Chat', icon: Brain },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

export function Sidebar(): JSX.Element {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-slate-200 bg-white/80 p-4 backdrop-blur md:h-screen md:w-72 md:border-b-0 md:border-r md:p-6">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-600">EstateAI</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">AI Copilot</h1>
        <p className="mt-2 text-xs text-slate-500">TurboTax for home transactions.</p>
      </div>

      <nav className="grid grid-cols-2 gap-2 md:grid-cols-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
