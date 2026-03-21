#  QA Insight AI-Powered Bug Documentation Tool

QA Insight merupakan project web application berbasis Next.js yang membantu tim QA mengubah screenshot bug menjadi laporan terstruktur secara otomatis menggunakan AI.

---

## Features

*  Upload screenshot bug
*  AI auto-generate bug report (title, steps, severity, dll)
*  Editable result (user tetap bisa refine)
*  Fast analysis menggunakan Gemini 2.5 Flash
*  Structured output (clean & readable)
*  Modern UI (Next.js + Tailwind)

---

## Problem Statement

Dalam banyak tim QA:

* Dokumentasi bug dilakukan manual (Excel / docs)
* Tidak konsisten (format berbeda-beda)
* Memakan waktu (copy-paste + penulisan ulang)

QA Insight menyelesaikan ini dengan:

> Mengubah screenshot menjadi laporan bug terstruktur secara otomatis.

---

##  Tech Stack

* **AI Development Tooling**: Gemini CLI
* **Frontend**: Next.js (App Router)
* **UI**: Tailwind CSS + shadcn/ui
* **AI Integration**: Google Gemini API (gemini-2.5-flash)
* **State Management**: React Hooks
* **API Layer**: Next.js Route Handlers

---

## Gemini CLI Workflow (Key Highlight)

Project ini dikembangkan menggunakan **Gemini CLI** sebagai AI development assistant.


---

###  ChatGPT (System Design & Architecture)

Digunakan untuk:

* Mendesain arsitektur aplikasi
* Merancang flow System
* Menentukan data schema

---

###  Gemini CLI (Execution & Iteration)

Digunakan sebagai hands-on development assistant:

* Code generation & refactoring
* Debugging (module error, API error, runtime error)
* Iterative improvements (UI, API, AI integration)

---

###  How They Work Together

* ChatGPT → **planning layer**
* Gemini CLI → **execution layer**


---


##  Project Structure

```id="w9dn4p"
qa-insight/
├── app/
│   ├── api/analyze/route.ts     # AI endpoint
│   ├── layout.tsx
│   └── page.tsx                # Main UI
├── src/
│   └── ai/gemini.ts            # AI integration logic
├── components/
│   └── ui/
├── lib/
│   └── utils.ts
```

---

##  Setup & Installation

### 1. Clone repo

```bash id="k3o6ve"
git clone https://github.com/your-username/qa-insight.git
cd qa-insight
```

---

### 2. Install dependencies

```bash id="r6q5l1"
npm install
```

---

### 3. Setup environment variables

Buat file `.env.local`

```env id="g9a2zm"
GEMINI_API_KEY=your_api_key_here
```

---

### 4. Run project

```bash id="9e4y0v"
npm run dev
```

---

##  How It Works

1. User upload screenshot bug
2. Image dikonversi ke base64
3. Request dikirim ke `/api/analyze`
4. Gemini AI memproses image
5. Output JSON ditampilkan di UI
6. User bisa edit sebelum finalize

---

##  Future Improvements

*  Save bug report (database)
*  Dashboard analytics
*  Filtering & search
*  Jira / Notion integration
*  Export PDF

---



##  Note

> This project is not only about AI integration,
> but also about leveraging AI tools (Gemini CLI, OpenClaw, Claude Code, etc)
> to accelerate real-world product development.

---
