# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface, and an LLM (Claude via Vercel AI SDK) generates React/JSX code that renders in a sandboxed iframe preview. The app works without an API key using a mock provider that returns static components.

## Commands

- `npm run setup` — Install deps, generate Prisma client, run migrations
- `npm run dev` — Start dev server with Turbopack (port 3000)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run test` — Vitest (jsdom environment)
- `npx vitest run src/path/to/test.test.ts` — Run a single test file
- `npx prisma migrate dev` — Apply schema changes
- `npm run db:reset` — Reset database

## Architecture

### Core Flow

1. **Chat** (`src/lib/contexts/chat-context.tsx`) — Wraps Vercel AI SDK's `useChat` hook, sends messages to `/api/chat` with the serialized virtual file system
2. **API Route** (`src/app/api/chat/route.ts`) — Receives messages + files, reconstructs `VirtualFileSystem`, calls `streamText` with two tools: `str_replace_editor` and `file_manager`
3. **Tool Execution** — Tools modify the server-side `VirtualFileSystem`. Tool calls are also replayed client-side via `handleToolCall` in `FileSystemContext` to keep the UI in sync
4. **Preview** (`src/components/preview/PreviewFrame.tsx`) — Transforms all virtual files with Babel (`src/lib/transform/jsx-transformer.ts`), creates blob URLs and an import map, renders in a sandboxed iframe with Tailwind CDN

### Virtual File System

`VirtualFileSystem` (`src/lib/file-system.ts`) is an in-memory tree of `FileNode` objects. No files are written to disk. It serializes/deserializes to JSON for persistence in the database and for sending to the API.

### LLM Tools

- **str_replace_editor** (`src/lib/tools/str-replace.ts`) — Create files, string-replace edits, line insertions
- **file_manager** (`src/lib/tools/file-manager.ts`) — Rename/delete files

### Provider

`src/lib/provider.ts` — Returns either the real Anthropic model (`claude-haiku-4-5`) or a `MockLanguageModel` when no `ANTHROPIC_API_KEY` is set. The mock generates static counter/form/card components.

### Preview Pipeline

`src/lib/transform/jsx-transformer.ts` handles: Babel JSX/TS transformation → blob URL creation → import map generation (with `@/` alias support and esm.sh for third-party packages) → full HTML document with error boundary.

### Data Model

SQLite via Prisma. Two models: `User` (email/password auth with bcrypt+JWT) and `Project` (stores messages and file system data as JSON strings). Anonymous users can use the app without auth; authenticated users get project persistence.

### Layout

`MainContent` (`src/app/main-content.tsx`) is the main UI shell: resizable left panel (chat) + right panel (preview/code toggle). Code view has a file tree + Monaco editor. Context providers nest as: `FileSystemProvider` → `ChatProvider` → UI.

### Auth

Custom JWT-based auth (`src/lib/auth.ts`) with bcrypt passwords. Middleware (`src/middleware.ts`) handles session validation. The `use-auth` hook manages client-side auth state.

## Environment Variables

- `ANTHROPIC_API_KEY` — Optional. If absent/empty, the mock provider is used automatically
- `JWT_SECRET` — Optional. Defaults to `"development-secret-key"`; set in production

## Testing

Tests are co-located in `__tests__` subdirectories alongside source files. They use `@testing-library/react` and `@testing-library/user-event`. Contexts and child components are typically mocked with `vi.mock()`.

## Key Conventions

- The LLM system prompt requires every generated project to have a root `/App.jsx` as the entry point
- All generated component imports use the `@/` alias (mapped to virtual FS root)
- UI components in `src/components/ui/` are shadcn/ui (Radix + Tailwind)
- Tailwind CSS v4 (PostCSS-based, no `tailwind.config.js`)
- Tool calls execute server-side in the API route; the client replays them via `handleToolCall` in `FileSystemContext` to stay in sync — both sides must handle any new tool
- Mock provider (`src/lib/provider.ts`) detects component type from prompt keywords ("form" → ContactForm, "card" → Card, default → Counter) and simulates a multi-step LLM workflow with streaming delays
- Anonymous work is tracked via `anon-work-tracker.ts` (sessionStorage); authenticated users have work auto-saved to their Project on chat completion
- System prompt is in `src/lib/prompts/generation.tsx`; key directives: root `/App.jsx` required, `@/` imports, Tailwind-only styling, brief responses
