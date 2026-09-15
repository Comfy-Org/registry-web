import React from "react";
import Markdown, { type Components } from "react-markdown";

type ChangelogMarkdownProps = {
  /** The changelog / release notes content, written in Markdown. */
  children?: string | null;
  /** Extra classes applied to the wrapping container (e.g. line-clamp for previews). */
  className?: string;
  /**
   * Render the changelog flattened to inline text instead of styled Markdown
   * blocks. Use for truncated previews: `line-clamp-*` relies on
   * `display: -webkit-box` clamping inline content, so block elements (`p`,
   * `ul`, headings) break the clamp. Plain mode keeps the content inline so the
   * clamp works, while the drawer keeps the full Markdown rendering.
   */
  plain?: boolean;
};

/** Full Markdown rendering with dark-theme styling for the version drawer. */
const RICH_COMPONENTS: Components = {
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
};

/**
 * Flatten every Markdown block to inline text so a truncated preview clamps
 * cleanly. Block elements render as their children plus a trailing space (to
 * keep words from adjacent blocks from fusing); links drop to their label text;
 * images are dropped entirely.
 */
const inline = ({ children }: { children?: React.ReactNode }) => <>{children} </>;
const bare = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

const PLAIN_COMPONENTS: Components = {
  p: inline,
  a: bare,
  ul: bare,
  ol: bare,
  li: inline,
  h1: inline,
  h2: inline,
  h3: inline,
  h4: inline,
  h5: inline,
  h6: inline,
  code: bare,
  pre: inline,
  blockquote: inline,
  em: bare,
  strong: bare,
  hr: () => <> </>,
  br: () => <> </>,
  img: () => null,
};

/**
 * Renders a node version changelog (release notes) as Markdown.
 *
 * The backend stores this field as Markdown, but it was historically rendered
 * as plain text. `react-markdown` does not render raw HTML by default, so this
 * is XSS-safe without additional sanitization.
 */
const ChangelogMarkdown: React.FC<ChangelogMarkdownProps> = ({
  children,
  className,
  plain = false,
}) => {
  return (
    <div className={className}>
      <Markdown components={plain ? PLAIN_COMPONENTS : RICH_COMPONENTS}>
        {children ?? ""}
      </Markdown>
    </div>
  );
};

export default ChangelogMarkdown;
