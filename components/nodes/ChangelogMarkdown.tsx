import React from "react";
import Markdown from "react-markdown";

type ChangelogMarkdownProps = {
  /** The changelog / release notes content, written in Markdown. */
  children?: string | null;
  /** Extra classes applied to the wrapping container (e.g. line-clamp for previews). */
  className?: string;
};

/**
 * Renders a node version changelog (release notes) as Markdown.
 *
 * The backend stores this field as Markdown, but it was historically rendered
 * as plain text. `react-markdown` does not render raw HTML by default, so this
 * is XSS-safe without additional sanitization.
 */
const ChangelogMarkdown: React.FC<ChangelogMarkdownProps> = ({ children, className }) => {
  return (
    <div className={className}>
      <Markdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="mb-2 ml-5 list-disc">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 ml-5 list-decimal">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          h1: ({ children }) => <h1 className="mt-2 mb-2 text-lg font-bold">{children}</h1>,
          h2: ({ children }) => <h2 className="mt-2 mb-2 text-base font-bold">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-2 mb-2 text-sm font-bold">{children}</h3>,
          code: ({ children }) => (
            <code className="px-1 py-0.5 text-sm bg-gray-800 rounded">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="p-3 mb-2 overflow-auto text-sm bg-gray-800 rounded">{children}</pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="pl-3 mb-2 border-l-2 border-gray-500">{children}</blockquote>
          ),
        }}
      >
        {children ?? ""}
      </Markdown>
    </div>
  );
};

export default ChangelogMarkdown;
