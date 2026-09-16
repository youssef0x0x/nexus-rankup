/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_QUEST_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
