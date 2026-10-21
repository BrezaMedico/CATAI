# 🛡️ UI Anti-SLOP Rules (Zero "AI-Slop" Policy)

> **Koleksi Aturan & Standar Desain Anti-AI Klise untuk AI Coding Assistant (Antigravity IDE, Cursor, Windsurf, Claude Code, Copilot, & LLMs).**

Kebanyakan model AI (Claude, GPT, Gemini) secara bawaan memiliki kecenderungan (*bias*) menghasilkan antarmuka web yang monoton, klise, dan membosankan: latar belakang ungu/cyan gelap, bola blur mengambang (`blur-3xl`), kartu glassmorphism murahan, teks gradien norak, grid 3-kolom repetitif, serta copywriting tanpa makna (*"Revolutionize", "Seamless", "Next-Gen"*).

Repositori ini menyediakan **aturan tegas (blacklisted tokens)** dan **design system alternatif buatan manusia (human-crafted standards)** yang memaksa model AI merancang antarmuka yang elegan, berkarakter, tactile, dan fungsional.

---

## 📁 Struktur Repositori

```text
UI-Anti-SLOP/
├── AGENTS.md            # Entrypoint utama & instruksi override system prompt
├── README.md            # Panduan instalasi dan penggunaan
└── rules/
    ├── Larangan.md      # Larangan absolut & checklist token terlarang (Blacklist)
    └── Rekomendasi.md   # Standar design system manusia: warna, tipografi, layout, & form
```

---

## 🚀 Cara Penggunaan

Pilih metode yang sesuai dengan tools atau workflow yang Anda gunakan:

### 1. Antigravity IDE (Rekomendasi Utama)

Antigravity secara otomatis memuat file `AGENTS.md` yang berada di root direktori project.

**Langkah:**
1. Salin file `AGENTS.md` dan folder `rules/` ke root direktori project Anda:
   ```text
   project-anda/
   ├── AGENTS.md
   ├── rules/
   │   ├── Larangan.md
   │   └── Rekomendasi.md
   ├── src/
   └── package.json
   ```
2. Selesai! Antigravity akan otomatis menginjeksi aturan ini ke setiap percakapan dan membatalkan kebiasaan slop bawaan.

---

### 2. Cursor IDE

Anda dapat menggunakan rules ini di Cursor melalui fitur Project Rules:

**Opsi A — `.cursorrules` (Klasik):**
Salin isi [AGENTS.md](./AGENTS.md) dan gabungkan ringkasan [rules/Larangan.md](./rules/Larangan.md) serta [rules/Rekomendasi.md](./rules/Rekomendasi.md) ke dalam file `.cursorrules` di root folder project.

**Opsi B — `.cursor/rules/` (Modern):**
1. Buat folder `.cursor/rules/` di project Anda.
2. Simpan file `anti-slop.mdc` yang merujuk ke file `rules/Larangan.md` dan `rules/Rekomendasi.md`.

---

### 3. Windsurf IDE (Cascade)

1. Buat atau buka file `.windsurfrules` di root project Anda.
2. Tambahkan instruksi berikut:
   ```markdown
   Always read and strictly enforce ./rules/Larangan.md and ./rules/Rekomendasi.md for any frontend/UI tasks.
   ```
3. Pastikan folder `rules/` tersedia di dalam workspace project.

---

### 4. Claude Code & Terminal Agents

1. Letakkan isi `AGENTS.md` ke dalam file `CLAUDE.md` di root repository Anda.
2. Claude Code akan membaca `CLAUDE.md` sebelum menjalankan perintah perubahan file.

---

### 5. Penggunaan Universal (ChatGPT Projects / Claude Projects / Custom Instructions)

Jika Anda menggunakan web UI (ChatGPT Plus, Claude Projects, Google AI Studio):
1. Buka pengaturan **Custom Instructions** atau **Project Knowledge**.
2. Salin seluruh isi teks dari [rules/Larangan.md](./rules/Larangan.md) dan [rules/Rekomendasi.md](./rules/Rekomendasi.md).
3. Simpan sebagai instruksi acuan desain antarmuka.

---

## ⚡ Perbandingan: AI-Slop vs Human-Crafted

| Elemen | ❌ Pola AI-Slop (Dilarang) | ✅ Alternatif Human-Crafted (Wajib) |
| :--- | :--- | :--- |
| **Palet Warna** | `slate-950` + `indigo-500` / `purple-600` + `cyan` | Latar hangat Alabaster (`#FAF8F5`) / Obsidian (`#0E0F0E`), border solid `1px` |
| **Permukaan** | Background blur orbs (`blur-3xl`) & Glassmorphism | Solid surfaces dengan kontras tegas (WCAG AA min 4.5:1) |
| **Tipografi** | Headline gradien teks (`bg-clip-text text-transparent`) | Warna solid kontras tinggi (`Plus Jakarta Sans`, `Instrument Serif`, `JetBrains Mono`) |
| **Layout** | Grid simetris 3-kolom berulang di setiap seksi | **Architectural Hairline Grid** (`divide-x`, `divide-y`) & Asymmetric Layout |
| **Hero Section** | Badge kapsul emoji (✨/🚀) + 2 tombol klise (Primary + Demo) | Komponen fungsional interaktif langsung (live search, filter table, data preview) |
| **Border Radius** | Serba `rounded-2xl` / `rounded-3xl` yang lembek | Radius terukur dan tajam: `6px` (button/input), `8px` (container) |
| **Interaksi** | Hover-lift (`hover:-translate-y-1`) pada elemen statis | Tactile feedback nyata (`active:translate-y-[1px]`), transisi cepat (150ms) |
| **Aset Visual** | Ilustrasi 3D clay generik, stock photo senyum palsu | Diagram skematik SVG, monospace terminal stream, preview data autentik |
| **Form Input** | Glow halo biru neon (`focus:ring-4 focus:ring-blue-500`) | Focus ring 1px netral dan rapat (`focus:ring-1 focus:ring-zinc-900`) |
| **Copywriting** | *"Revolutionize", "Supercharge", "Seamless", "Next-Gen"* | Bahasa lugas, spesifik, dan menjelaskan fungsi nyata aplikasi |

---

## 🔍 Pre-Flight Audit Checklist (Blacklist Tokens)

Sebelum AI mengirimkan hasil kode frontend, AI diwajibkan memeriksa dan mengeliminasi token-token berikut:

* **Tailwind CSS**: `bg-clip-text`, `text-transparent bg-gradient-`, `backdrop-blur`, `blur-xl`, `blur-2xl`, `blur-3xl`, `rounded-2xl`, `rounded-3xl` *(pada container)*, `hover:-translate-y-1`, `hover:scale-105`, `shadow-2xl`, `indigo-600`, `purple-600`.
* **Vanilla CSS**: `backdrop-filter: blur`, `filter: blur`, `-webkit-background-clip: text`, `border-radius: 20px+` *(kecuali avatar/pill)*, `box-shadow: 0 20px 25px`.
* **Copywriting**: *"Revolutionize"*, *"Supercharge"*, *"Seamless"*, *"Cutting-edge"*, *"Next-Gen"*, *"Unleash"*, *"Elevate"*, *"Powering the future"*, *"Solusi Masa Depan"*, *"Transformasi Digital"*.

---

## 📄 Lisensi

[MIT License](LICENSE) — Bebas digunakan, dimodifikasi, dan didistribusikan untuk project komersial maupun non-komersial.
