"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Settings,
  Key,
  Moon,
  Sun,
  Monitor,
  Trash2,
  Info,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Bug,
  Github,
  RefreshCcw,
} from "lucide-react";

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    // Load saved settings
    const savedGeminiKey = localStorage.getItem("qa-gemini-key");
    const savedOpenaiKey = localStorage.getItem("qa-openai-key");
    const savedTheme = localStorage.getItem("qa-theme") as "light" | "dark" | "system";
    const savedHistory = localStorage.getItem("qa-insight-history");

    if (savedGeminiKey) setGeminiKey(savedGeminiKey);
    if (savedOpenaiKey) setOpenaiKey(savedOpenaiKey);
    if (savedTheme) setTheme(savedTheme);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistoryCount(Array.isArray(parsed) ? parsed.length : 0);
      } catch {}
    }

    // Apply theme
    applyTheme(savedTheme || "system");
  }, []);

  const applyTheme = (t: string) => {
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
    } else if (t === "light") {
      root.classList.remove("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  const handleSaveApiKeys = () => {
    localStorage.setItem("qa-gemini-key", geminiKey);
    localStorage.setItem("qa-openai-key", openaiKey);
    showSaved("API keys saved successfully!");
  };

  const handleThemeChange = (t: "light" | "dark" | "system") => {
    setTheme(t);
    localStorage.setItem("qa-theme", t);
    applyTheme(t);
    showSaved("Theme updated!");
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to delete all bug reports? This cannot be undone.")) {
      localStorage.removeItem("qa-insight-history");
      setHistoryCount(0);
      showSaved("All reports deleted!");
    }
  };

  const showSaved = (msg: string) => {
    setSavedMsg(msg);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveToEnv = () => {
    const env = `# QA Insight Environment Variables
GEMINI_API_KEY=${geminiKey || "<your-gemini-api-key>"}
OPENAI_API_KEY=${openaiKey || "<your-openai-api-key>"}
`;
    navigator.clipboard.writeText(env);
    showSaved("Environment variables copied to clipboard!");
  };

  return (
    <div className="min-h-screen p-6 md:p-10 space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your API keys, preferences, and data.
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-2 text-sm text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-right-5 duration-300">
            <CheckCircle2 className="h-4 w-4" />
            {savedMsg}
          </div>
        )}
      </div>

      {/* API Keys */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">API Keys</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Configure your AI provider API keys. Keys are stored locally in
                your browser.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-6 pt-0">
          {/* Gemini */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Google Gemini API Key</label>
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                ACTIVE
              </span>
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="AIza..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-2 hover:underline inline-flex items-center gap-1">
                Google AI Studio
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          {/* OpenAI */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">OpenAI API Key</label>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                OPTIONAL
              </span>
            </div>
            <Input
              type="password"
              placeholder="sk-..."
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Alternative AI provider. Get your key from{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-2 hover:underline inline-flex items-center gap-1">
                OpenAI Platform
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={handleSaveApiKeys} className="gap-2 shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
              Save API Keys
            </Button>
            <Button variant="outline" onClick={handleSaveToEnv} className="gap-2">
              <Info className="h-4 w-4" />
              Copy as .env
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-purple-500" />
              ) : theme === "light" ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Monitor className="h-5 w-5 text-purple-500" />
              )}
            </div>
            <div>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Customize the look and feel of the application.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <p className="text-sm font-medium">Theme</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light" as const, icon: Sun, label: "Light", desc: "Always light mode" },
              { value: "dark" as const, icon: Moon, label: "Dark", desc: "Always dark mode" },
              { value: "system" as const, icon: Monitor, label: "System", desc: "Match OS preference" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleThemeChange(opt.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                  theme === opt.value
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                }`}>
                <opt.icon className={`h-5 w-5 ${theme === opt.value ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-sm font-semibold">{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10">
              <Settings className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-base">Data Management</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Manage your local data and stored reports.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-5">
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Bug className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Saved Reports</p>
                <p className="text-xs text-muted-foreground">
                  {historyCount} report{historyCount !== 1 ? "s" : ""} stored in
                  local storage
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearHistory}
              className="gap-2"
              disabled={historyCount === 0}>
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          </div>

          <div className="rounded-xl border border-border/50 bg-muted/10 p-4 space-y-2">
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <AlertCircle className="h-4 w-4" />
              <p className="text-xs font-semibold">Storage Notice</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All bug reports and settings are stored locally in your browser&apos;s
              localStorage. Data is never sent to any external server except for
              AI analysis requests. Clearing your browser data will remove all
              saved reports.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-500/10">
              <Bug className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-base">About QA Insight</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                AI-powered bug reporting made simple.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
              <p className="text-xs text-muted-foreground">Version</p>
              <p className="text-sm font-semibold">0.1.0</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
              <p className="text-xs text-muted-foreground">Framework</p>
              <p className="text-sm font-semibold">Next.js 16</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
              <p className="text-xs text-muted-foreground">AI Provider</p>
              <p className="text-sm font-semibold">Google Gemini</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
              <p className="text-xs text-muted-foreground">UI Library</p>
              <p className="text-sm font-semibold">shadcn/ui + Tailwind</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            QA Insight transforms bug screenshots into structured bug reports
            using AI. Built with Next.js, Tailwind CSS, and Google Gemini.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
