import React, { useState } from 'react';
import { User } from '../types';
import {
  Check,
  CheckCircle2,
  Copy,
  Layers,
  Palette,
  Sparkles,
} from 'lucide-react';

interface WorkspaceDesignerProps {
  user: User;
  onCreateTask: (title: string, description: string) => void;
  onSubmitPR: (title: string, summary: string) => void;
}

const colorTokens = [
  { name: 'Canvas Background', light: '#FFFFFF', dark: '#0F172A', readability: 'Exceptional (21:1 ratio)', usage: 'Main screen background' },
  { name: 'Card & Panel Surface', light: '#F8FAFC', dark: '#1E293B', readability: 'High clarity (19.4:1 ratio)', usage: 'Boxes, widgets and sidebars' },
  { name: 'Border Lines', light: '#E2E8F0', dark: '#334155', readability: 'Subtle clean lines', usage: 'Separates cards and rows cleanly' },
  { name: 'Headlines & Text', light: '#0F172A', dark: '#F8FAFC', readability: 'Very high contrast (16.8:1)', usage: 'Main titles and key numbers' },
  { name: 'Secondary Text', light: '#64748B', dark: '#94A3B8', readability: 'Easy reading (4.8:1 ratio)', usage: 'Timestamps, usernames & helper text' },
  { name: 'Action Buttons', light: '#0F172A', dark: '#F1F5F9', readability: 'High contrast (18:1 ratio)', usage: 'Main clickable buttons and tabs' },
];

export const WorkspaceDesigner: React.FC<WorkspaceDesignerProps> = ({
  user,
  onCreateTask,
  onSubmitPR,
}) => {
  const [copied, setCopied] = useState(false);

  const copyTokensJson = () => {
    navigator.clipboard.writeText(JSON.stringify(colorTokens, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header Banner */}
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
              <span>PRODUCT DESIGN · VISUAL STANDARDS</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Product Designer Workspace
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Check app colors, verify that text is easy for everyone to read, inspect screen spacing, and propose design improvements to the development team.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyTokensJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied Colors' : 'Copy Color Codes'}</span>
            </button>
            <button
              onClick={() => onSubmitPR('Design: Improve button readability and contrast', 'Adjusted card borders and button colors to make sure text is crisp and readable on all screens.')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-xs"
            >
              <Palette className="h-3.5 w-3.5" />
              <span>Propose Design Update</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Color Palette & Readability */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Approved Color Palette & Readability
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ensures all text is clear, clean, and comfortable for human eyes
                </p>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-semibold">
                High Readability Certified
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-2">Color Element</th>
                    <th className="pb-2">Light Appearance</th>
                    <th className="pb-2">Dark Appearance</th>
                    <th className="pb-2">Readability</th>
                    <th className="pb-2">Where It Appears</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                  {colorTokens.map((t) => (
                    <tr key={t.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-900 dark:text-slate-200">
                        {t.name}
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span
                            className="inline-block h-3.5 w-3.5 rounded-sm border border-slate-300"
                            style={{ backgroundColor: t.light }}
                          />
                          <span className="text-slate-600 dark:text-slate-400">{t.light}</span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span
                            className="inline-block h-3.5 w-3.5 rounded-sm border border-slate-600"
                            style={{ backgroundColor: t.dark }}
                          />
                          <span className="text-slate-600 dark:text-slate-400">{t.dark}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-slate-700 dark:text-slate-300">
                        {t.readability}
                      </td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400">
                        {t.usage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Simple Visual Rules */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Design Principles for Good Usability
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
              Simple design rules that make this app feel natural and uncluttered
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-200 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Uncluttered Clean Text</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Information is shown with clean text and gentle separators (·). We avoid wrapping every tiny label in loud, colored pill capsules.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-200 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Stable, Aligned Numbers</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Numbers use even, fixed-width sizing so your screen doesn’t jitter or jump when speeds or percentages update in real-time.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-200 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Clean Single-Level Cards</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Flat cards with gentle 1-pixel hairline borders. We avoid nesting boxes inside boxes, which looks messy and confusing.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-200 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Comfortable Light & Dark Themes</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Both light mode and dark mode are carefully tuned so words remain razor-sharp and easy to read in any room lighting.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Fast Designer Tasks */}
        <div className="space-y-6">
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
              Add a Design Task to the Board
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Click any suggestion to quickly add it to your team's task board.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => onCreateTask('Check button sizes on mobile screens', 'Make sure buttons are large enough to easily tap with your thumb on mobile phones.')}
                className="w-full text-left p-2.5 text-xs rounded-lg border border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 transition-colors bg-slate-50/60 dark:bg-slate-800/30"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  + Mobile Button Sizing Task
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Make buttons easy to tap on phones
                </div>
              </button>

              <button
                onClick={() => onCreateTask('Adjust card spacing and padding', 'Give tables and widgets a little extra breathing room so text never feels cramped.')}
                className="w-full text-left p-2.5 text-xs rounded-lg border border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 transition-colors bg-slate-50/60 dark:bg-slate-800/30"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  + Add Spacing & Padding Task
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Ensure comfortable layout breathing room
                </div>
              </button>
            </div>
          </div>

          {/* Quick Typography Reference */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Typography & Fonts
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Main Font</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Inter / Roboto</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Numbers & Codes</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">JetBrains Mono</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Corner Curves</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Gently rounded</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Default Style</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Clean Light Look</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
