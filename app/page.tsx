"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ScanSearch,
  FileText,
  TrendingUp,
  Clock,
  ArrowRight,
  Bug,
  Zap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface HistoryItem {
  id: string;
  timestamp: number;
  image: string;
  analysis: {
    title: string;
    severity: "Low" | "Medium" | "High" | "Critical";
    description: string;
  };
}

const severityColors: Record<string, string> = {
  Critical: "bg-red-500",
  High: "bg-orange-500",
  Medium: "bg-yellow-500",
  Low: "bg-green-500",
};

export default function Dashboard() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("qa-insight-history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const totalReports = history.length;
  const criticalCount = history.filter(
    (h) => h.analysis.severity === "Critical"
  ).length;
  const highCount = history.filter((h) => h.analysis.severity === "High").length;

  const features = [
    {
      icon: Zap,
      title: "Instant Analysis",
      description: "AI-powered bug detection in seconds",
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      icon: ShieldCheck,
      title: "Structured Reports",
      description: "Generate professional bug reports",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: TrendingUp,
      title: "Track History",
      description: "Access all your past analyses anytime",
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      icon: Sparkles,
      title: "AI-Powered",
      description: "Powered by Google Gemini AI",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="min-h-screen p-6 md:p-10 space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm">
          Welcome back — here&apos;s an overview of your bug reporting activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10">
              <FileText className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalReports}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Total Reports
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10">
              <Bug className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {criticalCount}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  critical
                </span>
              </p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Critical Bugs
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10">
              <TrendingUp className="h-7 w-7 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {highCount}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  high
                </span>
              </p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                High Priority
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
              <ScanSearch className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Analyze a New Bug</h3>
              <p className="text-sm text-muted-foreground">
                Upload a screenshot and let AI generate a structured report.
              </p>
            </div>
          </div>
          <Button asChild size="lg" className="gap-2 shadow-md shrink-0">
            <Link href="/analyze">
              Start Analysis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Features
          </p>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card
              key={f.title}
              className="border-border/60 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <CardContent className="p-5 space-y-3">
                <div
                  className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center`}>
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h4 className="font-semibold text-sm">{f.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {history.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Recent Reports</h3>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
              <Link href="/reports">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {history.slice(0, 6).map((item) => (
              <Card
                key={item.id}
                className="border-border/60 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-28 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.analysis.title}
                      fill
                      className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-white truncate max-w-[60%]">
                        {item.analysis.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold text-white rounded-full px-2 py-0.5 ${
                          severityColors[item.analysis.severity]
                        }`}
                      >
                        {item.analysis.severity}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-auto py-0 px-1 text-[10px] text-primary">
                      <Link href="/reports">View →</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {history.length === 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              <ScanSearch className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">No reports yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Upload your first bug screenshot and let AI transform it into a
                structured report.
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/analyze">
                Analyze Your First Bug
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
