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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] sm:max-h-none flex flex-col animate-in slide-in-from-bottom duration-200 sm:animate-none">
        
        {/* Mobile Grab Handle */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 mb-0.5 sm:hidden" />

        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
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
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Close GitHub modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          
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

          {/* Step 3: Security & GitHub Secret Scanner Resolution */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center">
                  🔒
                </span>
                Fix GitHub Secret Scanning Alert (Google API Key)
              </span>
              <button
                onClick={() => copyToClipboard(`git rm --cached firebase-applet-config.json\ngit commit -m "fix(security): untrack firebase-applet-config.json"\ngit push origin main`, 3)}
                className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors"
              >
                {copiedStep === 3 ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copied Fix!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Fix</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-950">
              <p className="text-[11px] leading-relaxed text-amber-900">
                If GitHub flagged a <strong>"Google API Key"</strong> in <code>firebase-applet-config.json</code>, run these commands in your repository to untrack the file from git:
              </p>
              <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
                <pre className="whitespace-pre-wrap">{`git rm --cached firebase-applet-config.json
git commit -m "fix(security): untrack firebase-applet-config.json"
git push origin main`}</pre>
              </div>
              <ul className="text-[11px] space-y-1 list-disc list-inside text-amber-900 pt-1">
                <li><strong>Rotate & Revoke:</strong> In <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-amber-950">Google Cloud Credentials</a>, regenerate/delete the exposed key.</li>
                <li><strong>Restrict Key:</strong> Set HTTP Referrers to your domain and restrict API scope to Firestore & Auth.</li>
                <li><strong>Resolve Alert:</strong> In GitHub repo &gt; <em>Security</em> &gt; <em>Secret scanning</em>, close alert as <em>Revoked</em>.</li>
              </ul>
            </div>
          </div>

          {/* Step 4: 1-Click Hosting */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold flex items-center justify-center">
                4
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
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center"
          >
            Got it, thanks!
          </button>
        </div>

      </div>
    </div>
  );
};
