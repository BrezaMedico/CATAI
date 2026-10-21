/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_GEMINI_KEY_1?: string;
  readonly VITE_GEMINI_KEY_2?: string;
  readonly VITE_OPENAI_KEY_1?: string;
  readonly VITE_OPENAI_KEY_2?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
