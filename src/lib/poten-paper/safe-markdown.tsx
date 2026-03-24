'use client';

import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), 'h2', 'h3', 'h4', 'strong', 'em', 'ul', 'li', 'p'],
  attributes: {
    ...defaultSchema.attributes,
    '*': ['className'],
  },
};

const PDF_COMPONENTS: Components = {
  h2: ({ children }) => (
    <h3 className="font-bold text-gray-900 text-[14px] mt-5 mb-2">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="font-semibold text-gray-800 text-[13px] mt-4 mb-1">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="mb-2 text-[12px] leading-relaxed text-gray-700">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="space-y-0.5 mb-2 text-[12px]">{children}</ul>
  ),
  li: ({ children }) => (
    <li className="ml-4 list-disc text-gray-700">{children}</li>
  ),
};

const CARD_COMPONENTS: Components = {
  h2: ({ children }) => (
    <h3 className="font-bold text-foreground text-[15px] mt-5 mb-2">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="font-semibold text-foreground mt-4 mb-1">{children}</h4>
  ),
  p: ({ children }) => <p className="mb-2">{children}</p>,
  ul: ({ children }) => <ul className="space-y-1 mb-3">{children}</ul>,
  li: ({ children }) => <li className="ml-4 list-disc">{children}</li>,
};

interface SafeMarkdownProps {
  content: string;
  variant?: 'pdf' | 'card';
  className?: string;
}

export function SafeMarkdown({ content, variant = 'pdf', className }: SafeMarkdownProps) {
  if (!content) return null;

  return (
    <div className={className}>
      <ReactMarkdown
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        components={variant === 'pdf' ? PDF_COMPONENTS : CARD_COMPONENTS}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
