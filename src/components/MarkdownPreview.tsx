import type React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Wide research tables should scroll inside the preview rather than
// stretching the form. External links open in a new tab.
const MARKDOWN_COMPONENTS = {
  table: ({ children, ...props }: React.ComponentPropsWithoutRef<'table'>) => (
    <div className="markdown-table-scroll">
      <table {...props}>{children}</table>
    </div>
  ),
  a: ({ children, ...props }: React.ComponentPropsWithoutRef<'a'>) => (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

// Default export so this module can be lazy-loaded: react-markdown and its
// remark/micromark dependencies stay out of the main bundle until a reviewer
// actually opens the preview.
export default function MarkdownPreview({ value }: { value: string }) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
      {value}
    </Markdown>
  );
}
