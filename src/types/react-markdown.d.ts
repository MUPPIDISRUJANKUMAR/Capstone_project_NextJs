declare module 'react-markdown' {
  import * as React from 'react'

  export interface ReactMarkdownProps {
    children?: React.ReactNode
    className?: string
    linkTarget?: string
    components?: Record<string, React.ComponentType<any>>
  }

  const ReactMarkdown: React.ComponentType<ReactMarkdownProps>
  export default ReactMarkdown
}
