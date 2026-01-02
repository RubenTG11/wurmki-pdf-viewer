import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

/**
 * Renders Markdown content with support for:
 * - Tables (GitHub Flavored Markdown)
 * - Images
 * - HTML (for tables from context)
 * - Lists, bold, italic, code, etc.
 */
const MarkdownRenderer = ({ children, className = '' }) => {
  // Safety check
  if (!children) {
    return <span className={className}></span>
  }

  // Ensure children is a string
  const content = typeof children === 'string' ? children : String(children)

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
        // Customize table styling
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border border-gray-600" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-gray-800" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th className="px-4 py-2 border border-gray-600 text-left font-semibold text-gray-200" {...props} />
        ),
        tbody: ({ node, ...props }) => (
          <tbody className="bg-gray-900" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="px-4 py-2 border border-gray-600 text-gray-300" {...props} />
        ),
        tr: ({ node, ...props }) => (
          <tr className="hover:bg-gray-800 transition-colors" {...props} />
        ),
        // Image styling
        img: ({ node, ...props }) => (
          <img className="max-w-full h-auto rounded-lg my-4 border border-gray-700" {...props} />
        ),
        // Code blocks
        code: ({ node, inline, ...props }) => (
          inline
            ? <code className="px-1.5 py-0.5 bg-gray-800 rounded text-emerald-400 text-sm" {...props} />
            : <code className="block p-4 bg-gray-800 rounded-lg my-4 text-sm overflow-x-auto" {...props} />
        ),
        // Links
        a: ({ node, ...props }) => (
          <a className="text-emerald-400 hover:text-emerald-300 underline" target="_blank" rel="noopener noreferrer" {...props} />
        ),
        // Lists
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside my-2 space-y-1" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside my-2 space-y-1" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="text-gray-300" {...props} />
        ),
        // Blockquotes
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-emerald-600 pl-4 py-2 my-4 italic text-gray-400" {...props} />
        ),
        // Headings
        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
        // Paragraphs
        p: ({ node, ...props }) => <p className="my-2" {...props} />,
        // Strong and emphasis
        strong: ({ node, ...props }) => <strong className="font-bold text-gray-100" {...props} />,
        em: ({ node, ...props }) => <em className="italic" {...props} />,
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer
