import type { CodeExample, ColorSwatch, Option, ThemeMode, WindowMode, WorkspaceState } from '@/app/types/code-frame';

export const CODE_EXAMPLES: Record<string, CodeExample> = {
  php: {
    fileName: 'index.php',
    markLines: [10, 12, 17],
    code: `<?php

namespace App\\Http\\Controllers;

use App\\Models\\Post;
use Illuminate\\Http\\Request;

class PostController extends Controller
{
    public function store(Request $request): Post
    {
        $validated = $request->validate([
            'title' => ['required', 'max:255'],
            'body'  => ['required'],
        ]);

        return Post::create($validated);
    }
}`,
  },
  javascript: {
    fileName: 'analytics.js',
    markLines: [4, 8],
    code: `const events = new Map();

export function track(eventName, payload = {}) {
  const count = events.get(eventName) ?? 0;
  events.set(eventName, count + 1);

  return fetch('/api/events', {
    method: 'POST',
    body: JSON.stringify({ eventName, payload }),
  });
}`,
  },
  typescript: {
    fileName: 'repository.ts',
    markLines: [8, 12],
    code: `type User = {
  id: string;
  email: string;
  active: boolean;
};

export async function findActiveUsers(): Promise<User[]> {
  const response = await fetch('/api/users?active=true');
  const users = (await response.json()) as User[];

  return users.filter((user) => user.active);
}`,
  },
  python: {
    fileName: 'pipeline.py',
    markLines: [5, 10],
    code: `from dataclasses import dataclass


@dataclass
class Job:
    name: str
    retries: int = 3


def run(job: Job) -> str:
    return f"running {job.name} with {job.retries} retries"`,
  },
  css: {
    fileName: 'panel.css',
    markLines: [6, 13],
    code: `.panel {
  display: grid;
  gap: 12px;
  padding: 16px;
  color: var(--fg);
  background: var(--surface);
  border: 1px solid var(--border);
}

.panel:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-ring);
}`,
  },
  markup: {
    fileName: 'card.html',
    markLines: [3, 8],
    code: `<article class="snippet">
  <header>
    <strong>CodeFrame</strong>
    <span>PHP</span>
  </header>

  <pre><code>return Post::create($validated);</code></pre>
</article>`,
  },
  json: {
    fileName: 'theme.json',
    markLines: [4, 9],
    code: `{
  "name": "AM Frame",
  "theme": "dark",
  "fontSize": 14,
  "lineHeight": 1.75,
  "window": {
    "chrome": "macos",
    "lineNumbers": true
  }
}`,
  },
  bash: {
    fileName: 'deploy.sh',
    markLines: [5, 8],
    code: `#!/usr/bin/env bash
set -euo pipefail

npm ci
npm run build

rsync -az .next/ deploy@server:/srv/codeframe
systemctl reload codeframe`,
  },
  rust: {
    fileName: 'main.rs',
    markLines: [6, 10],
    code: `#[derive(Debug)]
struct Snippet {
    language: String,
    lines: usize,
}

fn main() {
    let snippet = Snippet { language: "rust".into(), lines: 12 };
    println!("{snippet:?}");
}`,
  },
  go: {
    fileName: 'server.go',
    markLines: [9, 14],
    code: `package main

import (
    "encoding/json"
    "net/http"
)

func health(w http.ResponseWriter, r *http.Request) {
    payload := map[string]string{"status": "ok"}
    json.NewEncoder(w).Encode(payload)
}

func main() {
    http.HandleFunc("/health", health)
    http.ListenAndServe(":8080", nil)
}`,
  },
  sql: {
    fileName: 'query.sql',
    markLines: [4, 9],
    code: `select
  posts.id,
  posts.title,
  count(comments.id) as comments_count
from posts
left join comments on comments.post_id = posts.id
where posts.published_at is not null
group by posts.id, posts.title
order by comments_count desc;`,
  },
};

export const DEFAULT_CODE = CODE_EXAMPLES.php.code;

export const DEFAULT_STATE: WorkspaceState = {
  lang: 'php',
  theme: 'dark',
  win: 'macos',
  fileName: CODE_EXAMPLES.php.fileName,
  font: 'JetBrains Mono',
  fs: 14,
  lh: 1.75,
  pad: 40,
  fullWidth: false,
  width: 720,
  lineNumbers: true,
  lineStart: 1,
  markLines: CODE_EXAMPLES.php.markLines,
  bg: '#0B0B0D',
  customBg: false,
};

export const LANGUAGES: Array<Option> = [
  { value: 'php', label: 'PHP' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'css', label: 'CSS' },
  { value: 'markup', label: 'HTML / XML' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash / Shell' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'sql', label: 'SQL' },
];

export const THEMES: Array<Option<ThemeMode>> = [
  { value: 'dark', label: 'AM Frame · Dark' },
  { value: 'light', label: 'AM Frame · Light' },
];

export const WINDOWS: Array<Option<WindowMode>> = [
  { value: 'macos', label: 'macOS' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'none', label: 'None' },
];

export const FONTS = ['JetBrains Mono', 'Courier New', 'ui-monospace'];

export const SWATCHES: ColorSwatch[] = [
  { value: '#0D0D10', title: 'Graphite', borderColor: '#333' },
  { value: '#05071A', title: 'Midnight' },
  { value: '#050F0D', title: 'Forest' },
  { value: '#100B05', title: 'Ember' },
  { value: '#000000', title: 'Void', borderColor: '#333' },
  { value: '#F4EFE9', title: 'Bone' },
  { value: '#FFFFFF', title: 'White', borderColor: '#ccc' },
];
