import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bug,
  CheckCircle2,
  Code2,
  Laptop,
  Palette,
  Play,
  Presentation,
  Rocket,
  Shield,
  Users,
  X,
} from 'lucide-react';

interface RolePresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchRoleForDemo?: (role: string) => void;
}

interface Slide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  roleIcon: React.ReactNode;
  themeColor: string;
  whatTheyDo: string[];
  keyActionsInDemo: string[];
  speakerScript: string;
}

const slides: Slide[] = [
  {
    id: 'intro',
    badge: 'SLIDE 1 OF 6 · SYSTEM OVERVIEW',
    title: 'SysOps Team Hub: One Shared Workspace',
    subtitle: 'Connecting Design, Development, Testing, and Management in One Clean Dashboard',
    roleIcon: <Laptop className="h-7 w-7 text-slate-800 dark:text-slate-200" />,
    themeColor: 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900',
    whatTheyDo: [
      'Eliminates confusion by giving all 4 roles a single source of truth.',
      'Tracks live server health, ongoing tasks, and software update proposals in real time.',
      'Provides role-based security so each teammate sees the exact tools they need.',
    ],
    keyActionsInDemo: [
      'Point out the clean top navigation: Workspace, System Health, Proposed Changes, Task Board.',
      'Highlight the Light theme with instant Light/Dark mode switching.',
      'Explain that accounts are protected with secure passwords and role verification.',
    ],
    speakerScript:
      '"Welcome! Today I am presenting SysOps Team Hub. In many companies, designers, developers, testers, and managers use disconnected tools. SysOps Team Hub brings all four roles together into one clean, easy-to-understand workspace. Let me walk you through each role and how they collaborate."',
  },
  {
    id: 'designer',
    badge: 'SLIDE 2 OF 6 · ROLE 1',
    title: 'Product Designer (UI/UX)',
    subtitle: 'The Look & Feel Guardian: Ensuring High Readability and Visual Quality',
    roleIcon: <Palette className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />,
    themeColor: 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30',
    whatTheyDo: [
      'Manages approved color codes and contrast standards for maximum readability.',
      'Ensures screen spacing, comfortable button sizes, and clean unboxed text.',
      'Proposes design changes and adds design tasks directly to the team task board.',
    ],
    keyActionsInDemo: [
      'Show the "Approved Color Palette & Readability" table with contrast ratings.',
      'Click "Copy Color Codes" to show how design assets are shared with developers.',
      'Click "Propose Design Update" to send a design proposal into the review queue.',
    ],
    speakerScript:
      '"First is the Product Designer. Their job is to ensure the app looks professional and is comfortable for everyone to read. In their workspace, they verify color contrast, audit button sizes for mobile screens, and propose visual updates with a single click."',
  },
  {
    id: 'developer',
    badge: 'SLIDE 3 OF 6 · ROLE 2',
    title: 'Software Developer',
    subtitle: 'The Builder: Packaging Software Updates & Reviewing Code Changes',
    roleIcon: <Code2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />,
    themeColor: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30',
    whatTheyDo: [
      'Builds application features and prepares ready-to-deploy software packages.',
      'Monitors core services (Web API, Login Service, Background Workers).',
      'Reviews proposed changes from teammates and officially approves (merges) code.',
    ],
    keyActionsInDemo: [
      'Select an app component and click "Prepare Package" to watch live simulated assembly logs.',
      'Inspect the "App Services Status" cards showing healthy server copies.',
      'Open the "Proposed Changes" tab and demonstrate approving a change into the main app.',
    ],
    speakerScript:
      '"Next is the Software Developer. Developers build the actual software. In their workspace, they can package new updates, watch step-by-step assembly logs, and monitor background services. Developers also have the authority to review and approve feature changes."',
  },
  {
    id: 'qa',
    badge: 'SLIDE 4 OF 6 · ROLE 3',
    title: 'Quality Tester (QA)',
    subtitle: 'The Bug Finder: Verifying App Safety, Speed, and Stability',
    roleIcon: <Bug className="h-7 w-7 text-amber-600 dark:text-amber-400" />,
    themeColor: 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30',
    whatTheyDo: [
      'Runs automated safety checkups on app logins, navigation, and security.',
      'Verifies that screens load quickly and do not crash under high traffic.',
      'Reports bugs and issues directly to the team task board so developers can fix them.',
    ],
    keyActionsInDemo: [
      'Select "App Login & Navigation Safety Check" and click "Start Checkup".',
      'Show the results card: Checks passed, execution time, and checklist summary.',
      'Fill in the "Report a Problem (Bug)" form to send an urgent bug card to the task board.',
    ],
    speakerScript:
      '"Third is the Quality Tester. Their mission is to find bugs before real users do. Testers can run automated checkups on login safety and screen speed. When an issue is spotted, they can log it right from their workspace onto the task board with one click."',
  },
  {
    id: 'manager',
    badge: 'SLIDE 5 OF 6 · ROLE 4',
    title: 'Team Manager',
    subtitle: 'The Decider: Approving Teammates & Launching Official App Updates',
    roleIcon: <Rocket className="h-7 w-7 text-purple-600 dark:text-purple-400" />,
    themeColor: 'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30',
    whatTheyDo: [
      'Holds the preset company administrative account (self-signup is disabled for security).',
      'Reviews new team members who sign up and clicks "Approve Teammate" to verify them.',
      'Officially publishes new update versions to all users or a pilot test group.',
    ],
    keyActionsInDemo: [
      'Show the "Team Roster & Member Approvals" table and click "Approve Teammate".',
      'Demonstrate the "Launch Official App Update" form with Version Name and Audience selection.',
      'Point out past update history showing who approved each release.',
    ],
    speakerScript:
      '"Finally, we have the Team Manager. The manager has full governance. Because managers approve team members and publish updates, manager accounts are preset by the company. The manager verifies newly registered teammates and has the final button to launch updates live to all users."',
  },
  {
    id: 'workflow',
    badge: 'SLIDE 6 OF 6 · COLLABORATION FLOW',
    title: 'How All 4 Roles Work Together',
    subtitle: 'A Seamless End-to-End Cycle from Idea to Official Launch',
    roleIcon: <Users className="h-7 w-7 text-blue-600 dark:text-blue-400" />,
    themeColor: 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30',
    whatTheyDo: [
      '1. Designer designs cleaner screen layouts and proposes a style update.',
      '2. Developer writes the code, prepares an update package, and tests the build.',
      '3. Tester runs automated safety checkups and verifies zero bugs.',
      '4. Manager reviews test results and officially launches the update to all users.',
    ],
    keyActionsInDemo: [
      'Switch between "System Health" and "Task Board" to show shared visibility.',
      'Show the notification bell at the top right receiving real-time alerts across roles.',
      'Conclude by emphasizing how easy and non-technical the app is for stakeholders to navigate.',
    ],
    speakerScript:
      '"To summarize: Designer styles the feature, Developer builds it, Tester verifies it is bug-free, and Manager launches it to the world. SysOps Team Hub makes this entire lifecycle visible, fast, and transparent for everyone on the team."',
  },
];

export const RolePresentationModal: React.FC<RolePresentationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  if (!isOpen) return null;

  const currentSlide = slides[currentSlideIndex];
  const isFirst = currentSlideIndex === 0;
  const isLast = currentSlideIndex === slides.length - 1;

  const goNext = () => {
    if (!isLast) setCurrentSlideIndex((prev) => prev + 1);
  };

  const goPrev = () => {
    if (!isFirst) setCurrentSlideIndex((prev) => prev - 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[92vh] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Slide Top Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Presentation className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Role Presentation Mode</span>
            <span className="text-slate-400">·</span>
            <span className="text-[11px] text-slate-500 font-normal">
              Slide {currentSlideIndex + 1} of {slides.length}
            </span>
          </div>

          {/* Quick Slide Dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlideIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  currentSlideIndex === i
                    ? 'w-6 bg-slate-900 dark:bg-slate-100'
                    : 'w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
                }`}
                title={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Slide Content Viewport */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Slide Header Banner */}
          <div className={`p-6 rounded-xl border ${currentSlide.themeColor} space-y-3`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                {currentSlide.badge}
              </span>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-2xs">
                {currentSlide.roleIcon}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {currentSlide.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {currentSlide.subtitle}
              </p>
            </div>
          </div>

          {/* 2-Column Presentation Details: What They Do & Demo Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            {/* What They Do */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-2.5">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Primary Responsibilities</span>
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                {currentSlide.whatTheyDo.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What to Click in the Live Demo */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-2.5">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Play className="h-4 w-4 text-indigo-600 fill-current" />
                <span>What to Click in Your Live Demo</span>
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                {currentSlide.keyActionsInDemo.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-indigo-500 font-bold mt-0.5">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Speaker Script Box (What you can say out loud) */}
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-xs space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
              Suggested Presentation Script (Say Out Loud):
            </span>
            <p className="text-slate-800 dark:text-slate-200 italic leading-relaxed text-[13px]">
              {currentSlide.speakerScript}
            </p>
          </div>

        </div>

        {/* Slide Bottom Navigation Controls */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={isFirst}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Previous Slide</span>
          </button>

          <span className="text-xs text-slate-500 hidden sm:inline">
            Use arrows to navigate between role slides
          </span>

          <button
            onClick={goNext}
            disabled={isLast}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-xs"
          >
            <span>Next Slide</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
