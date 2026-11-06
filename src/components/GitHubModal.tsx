import React, { useState } from 'react';
import { 
  X, 
  GitBranch, 
  Copy, 
  Check, 
  Terminal, 
  ExternalLink, 
  Globe, 
  CheckCircle2, 
  Sparkles,
  Download
} from 'lucide-react';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [repoName, setRepoName] = useState('splitease-app');

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const gitCommands = `# 1. Open your terminal in this project folder
git init
git add .
git commit -m "feat: Splitwise clone with debt simplification, custom splits & self-join"
git branch -M main

# 2. Add your GitHub remote repository (replace with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/${repoName}.git

# 3. Push to your new GitHub repository!
git push -u origin main`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Host on Your GitHub</h3>
              <p className="text-xs text-slate-500">Push to a new GitHub repo & deploy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-950">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Project is 100% production-ready</span>
              <p className="text-emerald-800 text-[11px]">
                The complete code including Vite, React 19, Tailwind CSS v4, Lucide icons, unit tests, and Splitwise debt simplification algorithms is fully packaged in this workspace.
              </p>
            </div>
          </div>

          {/* Step 1: Create repository on GitHub */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold flex items-center justify-center">
                  1
                </span>
                Create a new repository on GitHub
              </span>
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                <span>github.com/new</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-slate-500">
              Go to GitHub and create an empty repository (leave README and .gitignore unchecked since they already exist in this project).
            </p>
          </div>

          {/* Step 2: Push commands */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold flex items-center justify-center">
                  2
                </span>
                Run these Git commands to push
              </span>
              <button
                onClick={() => copyToClipboard(gitCommands, 2)}
                className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors"
              >
                {copiedStep === 2 ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copied Commands!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy All</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-xs overflow-x-auto">
              <pre className="leading-relaxed whitespace-pre-wrap">{gitCommands}</pre>
            </div>
          </div>

          {/* Step 3: 1-Click Hosting */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold flex items-center justify-center">
                3
              </span>
              Free 1-Click Live Hosting Options
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 block mb-0.5">GitHub Pages</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Turn on Settings &gt; Pages in your GitHub repo or use the included GitHub Actions workflow.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 block mb-0.5">Vercel / Cloudflare</span>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Import the repository directly from GitHub with automatic builds and instant SSL.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Got it, thanks!
          </button>
        </div>

      </div>
    </div>
  );
};
