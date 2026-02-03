'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search, Plus } from 'lucide-react';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/ideas': { title: 'Ideas', subtitle: 'Brainstorm and develop your content ideas' },
  '/posts': { title: 'Posts', subtitle: 'Create and manage your content posts' },
  '/trends': { title: 'Trends', subtitle: 'Research trending topics for your content' },
  '/settings': { title: 'Settings', subtitle: 'Configure your profiles and preferences' },
  '/audit': { title: 'Audit Log', subtitle: 'Track all changes and generations' },
};

export function Header() {
  const pathname = usePathname();
  const basePath = '/' + pathname.split('/')[1];
  const pageInfo = pageTitles[basePath] || { title: 'Dashboard', subtitle: 'Welcome back' };

  return (
    <header className="flex h-20 items-center justify-between bg-white/50 backdrop-blur-sm border-b border-[var(--color-border)] px-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">{pageInfo.title}</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">{pageInfo.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-10 pr-4 py-2 rounded-xl border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all text-sm"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-xl bg-white border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-secondary)] transition-colors">
          <Bell className="w-5 h-5 text-[var(--color-muted-foreground)]" />
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center">
            3
          </span>
        </button>

        {/* Quick create */}
        <button className="h-10 px-4 rounded-xl bg-gradient-primary text-white text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create</span>
        </button>
      </div>
    </header>
  );
}
