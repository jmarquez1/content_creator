'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Lightbulb,
  FileText,
  TrendingUp,
  Settings,
  ClipboardList,
  LogOut,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Ideas', href: '/ideas', icon: Lightbulb, description: 'Brainstorm & develop' },
  { name: 'Posts', href: '/posts', icon: FileText, description: 'Create & publish' },
  { name: 'Trends', href: '/trends', icon: TrendingUp, description: 'Research topics' },
  { name: 'Settings', href: '/settings', icon: Settings, description: 'Configure profiles' },
  { name: 'Audit Log', href: '/audit', icon: ClipboardList, description: 'Track changes' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex h-full w-72 flex-col bg-white border-r border-[var(--color-border)]">
      {/* Logo */}
      <div className="flex h-20 items-center px-6 border-b border-[var(--color-border)]">
        <Link href="/ideas" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-gradient">ContentFlow</span>
            <p className="text-xs text-[var(--color-muted-foreground)]">Content Creator</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="px-3 py-2 text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
          Main Menu
        </p>
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all',
                isActive
                  ? 'bg-gradient-primary text-white shadow-md'
                  : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-foreground)]'
              )}
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                  isActive
                    ? 'bg-white/20'
                    : 'bg-[var(--color-secondary)] group-hover:bg-white'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive ? 'text-white' : '')} />
              </div>
              <div className="flex-1">
                <span className="block">{item.name}</span>
                <span
                  className={cn(
                    'text-xs',
                    isActive ? 'text-white/70' : 'text-[var(--color-muted-foreground)]'
                  )}
                >
                  {item.description}
                </span>
              </div>
              <ChevronRight
                className={cn(
                  'h-4 w-4 opacity-0 -translate-x-2 transition-all',
                  isActive
                    ? 'opacity-100 translate-x-0 text-white/70'
                    : 'group-hover:opacity-100 group-hover:translate-x-0'
                )}
              />
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-[var(--color-border)]">
        {/* Quick stats card */}
        <div className="mb-4 p-4 rounded-xl bg-gradient-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--color-muted-foreground)]">This week</span>
            <span className="text-xs text-[var(--color-primary)]">View all</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-2xl font-bold text-[var(--color-foreground)]">12</p>
              <p className="text-xs text-[var(--color-muted-foreground)]">Ideas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-foreground)]">8</p>
              <p className="text-xs text-[var(--color-muted-foreground)]">Posts</p>
            </div>
          </div>
        </div>

        {/* Sign out button */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--color-muted-foreground)] transition-all hover:bg-[var(--color-destructive)]/10 hover:text-[var(--color-destructive)] group"
        >
          <div className="w-9 h-9 rounded-lg bg-[var(--color-secondary)] flex items-center justify-center group-hover:bg-[var(--color-destructive)]/10 transition-colors">
            <LogOut className="h-5 w-5" />
          </div>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
