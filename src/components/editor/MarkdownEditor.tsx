"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  // Simple markdown to HTML converter (in production, use a proper library like marked or remark)
  const convertMarkdownToHTML = (markdown: string): string => {
    return markdown
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /```([\s\S]*?)```/g,
        '<pre class="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto"><code>$1</code></pre>'
      )
      .replace(
        /`(.*?)`/g,
        '<code class="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">$1</code>'
      )
      .replace(/^- (.*$)/gim, '<li class="mb-1">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^\s*(.+)/gm, '<p class="mb-4">$1</p>');
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-2 flex justify-between items-center">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Markdown Editor
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center gap-2"
        >
          {isPreview ? (
            <>
              <Edit className="h-4 w-4" />
              แก้ไข
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              ดูตัวอย่าง
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {isPreview ? (
          <div
            className="prose prose-sm sm:prose lg:prose-lg max-w-none p-4"
            dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(value) }}
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="เขียน Markdown ของคุณที่นี่...

# หัวข้อใหญ่
## หัวข้อรอง

**ตัวหนา** และ *ตัวเอียง*

- รายการ
- รายการ

```javascript
const code = 'hello world'
```"
            className="w-full h-full min-h-[400px] p-4 bg-transparent border-none outline-none resize-none font-mono text-sm leading-relaxed"
          />
        )}
      </div>
    </div>
  );
}
