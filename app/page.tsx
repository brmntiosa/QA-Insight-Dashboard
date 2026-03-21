"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  Save,
  ChevronDown,
  Copy,
  Download,
  Check,
  History,
  Trash2,
  Clock,
} from "lucide-react";

interface BugAnalysis {
  title: string;
  description: string;
  steps_to_reproduce: string[];
  expected_result: string;
  actual_result: string;
  severity: "Low" | "Medium" | "High" | "Critical";
}

interface HistoryItem {
  id: string;
  timestamp: number;
  image: string;
  analysis: BugAnalysis;
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<BugAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("qa-insight-history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem("qa-insight-history", JSON.stringify(newHistory));
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setAnalysis(null);
      setError(null);
      setIsFinalized(false);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const handleAnalyze = async () => {
    if (!image) return;

    console.log("handleAnalyze: Starting analysis...");
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      console.log("handleAnalyze: Response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("handleAnalyze: Error response body:", errorText);
        throw new Error("Failed to analyze bug");
      }

      const data = await response.json();
      console.log("handleAnalyze: Received data:", data);
      setAnalysis(data);
    } catch (err: any) {
      console.error("handleAnalyze: Catch error:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (
    field: keyof BugAnalysis,
    value: string | string[],
  ) => {
    if (!analysis) return;
    setAnalysis({ ...analysis, [field]: value });
  };

  const handleStepChange = (index: number, value: string) => {
    if (!analysis || !analysis.steps_to_reproduce) return;
    const newSteps = [...analysis.steps_to_reproduce];
    newSteps[index] = value;
    handleFieldChange("steps_to_reproduce", newSteps);
  };

  const handleFinalize = () => {
    if (!analysis || !image) return;
    setIsFinalized(true);

    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      image,
      analysis,
    };

    saveHistory([newItem, ...history].slice(0, 10)); // Keep last 10
  };

  const formatReport = (targetAnalysis?: BugAnalysis) => {
    const report = targetAnalysis || analysis;
    if (!report) return "";
    return `BUG REPORT: ${report.title || "Untitled Bug"}
SEVERITY: ${report.severity || "Medium"}

DESCRIPTION:
${report.description || "No description provided."}

STEPS TO REPRODUCE:
${(report.steps_to_reproduce || []).map((step, i) => `${i + 1}. ${step}`).join("\n")}

EXPECTED RESULT:
${report.expected_result || "Not specified"}

ACTUAL RESULT:
${report.actual_result || "Not specified"}

---
Generated by QA Insight`;
  };

  const handleCopy = async () => {
    const text = formatReport();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = formatReport();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bug-report-${analysis?.title.toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setImage(item.image);
    setAnalysis(item.analysis);
    setIsFinalized(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveHistory(history.filter((item) => item.id !== id));
  };

  const removeImage = () => {
    setImage(null);
    setAnalysis(null);
    setError(null);
    setIsFinalized(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const ReportSkeleton = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <CardHeader className="p-6 pb-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />
            <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
          </div>
          <div className="h-20 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-md animate-pulse" />
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div className="space-y-4">
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                  <div className="h-4 flex-1 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-24 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 animate-pulse" />
            <div className="h-24 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 animate-pulse" />
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-center gap-2 text-zinc-400 text-xs font-medium">
        <Loader2 className="h-3 w-3 animate-spin" />
        AI is identifying UI inconsistencies...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50/50 p-4 md:p-8 dark:bg-zinc-950 font-sans text-zinc-950 dark:text-zinc-50 text-sm">
      <main className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col items-center justify-between gap-4 border-b border-zinc-200 pb-8 dark:border-zinc-800 md:flex-row md:items-end">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              QA Insight
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Transform bug screenshots into structured reports instantly.
            </p>
          </div>
          {(analysis || loading) && (
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                onClick={removeImage}
                disabled={loading}>
                {loading ? "Analyzing..." : "New Analysis"}
              </Button>
              {isFinalized ? (
                <>
                  <Button variant="outline" onClick={handleCopy}>
                    {copied ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    {copied ? "Copied" : "Copy Text"}
                  </Button>
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download .txt
                  </Button>
                </>
              ) : analysis ? (
                <Button
                  onClick={handleFinalize}
                  className="bg-green-600 hover:bg-green-700">
                  <Save className="mr-2 h-4 w-4" />
                  Finalize Report
                </Button>
              ) : null}
            </div>
          )}
        </header>

        {!analysis && !loading ? (
          <div className="grid gap-8">
            <div className="mx-auto w-full max-w-2xl">
              <Card
                className={`relative overflow-hidden transition-all duration-200 ${
                  isDragging
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}>
                <CardContent className="p-0">
                  <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={triggerFileInput}
                    className={`flex cursor-pointer flex-col items-center justify-center space-y-6 p-12 transition-colors ${
                      isDragging ? "bg-primary/5" : "bg-white dark:bg-zinc-900"
                    }`}>
                    {!image ? (
                      <>
                        <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                          <Upload className="h-8 w-8 text-zinc-400" />
                        </div>
                        <div className="space-y-2 text-center">
                          <p className="text-lg font-medium">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm text-zinc-500">
                            PNG, JPG or WebP (max. 10MB)
                          </p>
                        </div>
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </>
                    ) : (
                      <div className="relative w-full space-y-6">
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50">
                          <Image
                            src={image}
                            alt="uploaded image"
                            fill
                            className="object-contain"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute right-4 top-4 rounded-full shadow-lg"
                            onClick={removeImage}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          onClick={handleAnalyze}
                          disabled={loading}
                          className="h-12 w-full text-lg shadow-sm transition-all hover:shadow-md">
                          Generate Bug Report
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {history.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-500">
                  <History className="h-4 w-4" />
                  <h3 className="font-bold uppercase tracking-wider text-xs">
                    Recent Reports
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {history.map((item) => (
                    <Card
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="group relative cursor-pointer border-zinc-200 bg-white shadow-sm transition-all hover:border-primary/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                      <CardContent className="p-4 space-y-3">
                        <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                          <Image
                            src={item.image}
                            alt={item.analysis.title || "Bug Report Image"}
                            fill
                            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-80" />
                          <span
                            className={`absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white ring-1 ring-inset ${
                              item.analysis.severity === "Critical"
                                ? "bg-red-500 ring-red-400"
                                : item.analysis.severity === "High"
                                  ? "bg-orange-500 ring-orange-400"
                                  : item.analysis.severity === "Medium"
                                    ? "bg-yellow-500 ring-yellow-400"
                                    : "bg-green-500 ring-green-400"
                            }`}>
                            {item.analysis.severity}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold truncate text-zinc-900 dark:text-zinc-50">
                            {item.analysis.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                            <Clock className="h-3 w-3" />
                            {new Date(item.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-red-500"
                          onClick={(e) => removeFromHistory(item.id, e)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sidebar with Image Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <CardHeader className="p-4 border-b dark:border-zinc-800">
                    <CardTitle className="text-sm font-medium text-zinc-500">
                      Source Image
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 bg-zinc-100 dark:bg-zinc-900/50">
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                      <Image
                        src={image!}
                        alt="Source"
                        fill
                        className="object-contain cursor-zoom-in"
                      />
                    </div>
                  </CardContent>
                </Card>
                {isFinalized && !loading && (
                  <div className="rounded-xl bg-green-50 p-6 border border-green-200 dark:bg-green-900/10 dark:border-green-900/30 text-center space-y-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      Report Saved
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      This report has been saved to your local history.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {loading ? (
                <ReportSkeleton />
              ) : (
                analysis && (
                  <div className="space-y-6 animate-in fade-in duration-700">
                    <Card
                      className={`border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-opacity ${isFinalized ? "opacity-75 pointer-events-none" : ""}`}>
                      <div
                        className={`h-1.5 w-full ${
                          analysis.severity === "Critical"
                            ? "bg-red-500"
                            : analysis.severity === "High"
                              ? "bg-orange-500"
                              : analysis.severity === "Medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                        }`}
                      />
                      <CardHeader className="p-6 pb-0 space-y-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1">
                            <Input
                              value={analysis.title}
                              onChange={(e) =>
                                handleFieldChange("title", e.target.value)
                              }
                              className="text-2xl font-bold bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-zinc-300 h-auto"
                              placeholder="Bug Title"
                            />
                          </div>
                          <div className="relative inline-block text-left">
                            <select
                              value={analysis.severity}
                              onChange={(e) =>
                                handleFieldChange(
                                  "severity",
                                  e.target.value as any,
                                )
                              }
                              className={`appearance-none rounded-full px-4 py-1 text-xs font-semibold ring-1 ring-inset focus:outline-none cursor-pointer pr-8 ${
                                analysis.severity === "Critical"
                                  ? "bg-red-50 text-red-700 ring-red-600/20"
                                  : analysis.severity === "High"
                                    ? "bg-orange-50 text-orange-700 ring-orange-600/20"
                                    : analysis.severity === "Medium"
                                      ? "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
                                      : "bg-green-50 text-green-700 ring-green-600/20"
                              }`}>
                              <option value="Critical">
                                Critical Priority
                              </option>
                              <option value="High">High Priority</option>
                              <option value="Medium">Medium Priority</option>
                              <option value="Low">Low Priority</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none opacity-50" />
                          </div>
                        </div>
                        <Textarea
                          value={analysis.description}
                          onChange={(e) =>
                            handleFieldChange("description", e.target.value)
                          }
                          className="min-h-[80px] bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800 resize-none text-zinc-600 dark:text-zinc-400"
                          placeholder="Enter bug description..."
                        />
                      </CardHeader>

                      <CardContent className="p-6 space-y-8">
                        {/* Steps to Reproduce */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-zinc-400" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                              Steps to Reproduce
                            </h3>
                          </div>
                          <div className="space-y-3">
                            {(analysis.steps_to_reproduce || []).map((step, i) => (
                              <div
                                key={i}
                                className="flex gap-4 items-start group">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800">
                                  {i + 1}
                                </span>
                                <Input
                                  value={step}
                                  onChange={(e) =>
                                    handleStepChange(i, e.target.value)
                                  }
                                  className="bg-transparent border-none p-0 focus-visible:ring-0 h-auto text-zinc-700 dark:text-zinc-300"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Results Comparison */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-xl border border-green-100 bg-green-50/30 p-5 dark:border-green-900/20 dark:bg-green-900/5 space-y-2">
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle2 className="h-4 w-4" />
                              <h4 className="text-xs font-bold uppercase tracking-wider">
                                Expected Result
                              </h4>
                            </div>
                            <Textarea
                              value={analysis.expected_result}
                              onChange={(e) =>
                                handleFieldChange(
                                  "expected_result",
                                  e.target.value,
                                )
                              }
                              className="bg-transparent border-none p-0 focus-visible:ring-0 min-h-[60px] resize-none text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed"
                            />
                          </div>

                          <div className="rounded-xl border border-red-100 bg-red-50/30 p-5 dark:border-red-900/20 dark:bg-red-900/5 space-y-2">
                            <div className="flex items-center gap-2 text-red-700">
                              <AlertCircle className="h-4 w-4" />
                              <h4 className="text-xs font-bold uppercase tracking-wider">
                                Actual Result
                              </h4>
                            </div>
                            <Textarea
                              value={analysis.actual_result}
                              onChange={(e) =>
                                handleFieldChange(
                                  "actual_result",
                                  e.target.value,
                                )
                              }
                              className="bg-transparent border-none p-0 focus-visible:ring-0 min-h-[60px] resize-none text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </main>
    </div>
  );
}
