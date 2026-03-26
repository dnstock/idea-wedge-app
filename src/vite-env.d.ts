/// <reference types="vite/client" />

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// Use as global constant
declare const __COMMIT_HASH__: string;
