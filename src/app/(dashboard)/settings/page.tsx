import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Globe, FileText } from 'lucide-react';

const settingsSections = [
  {
    title: 'Voice Profiles',
    description: 'Manage your writing persona, tone rules, and readability guidelines',
    href: '/settings/voice-profiles',
    icon: User,
  },
  {
    title: 'Platform Profiles',
    description: 'Configure platform-specific formatting and content requirements',
    href: '/settings/platform-profiles',
    icon: Globe,
  },
  {
    title: 'Prompt Templates',
    description: 'Customize the AI prompts used for ideation and drafting',
    href: '/settings/prompt-templates',
    icon: FileText,
  },
];

export default function SettingsPage() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {settingsSections.map((section) => (
            <Link key={section.href} href={section.href}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <section.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
