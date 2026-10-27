import { Fragment, type ReactNode } from "react"
import { Link } from "react-router"

import politicaMarkdown from "./politica-tratamiento.md?raw"

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>
    }
    return <Fragment key={index}>{part}</Fragment>
  })
}

function renderPolicy(markdown: string): ReactNode[] {
  const lines = markdown.split(/\r?\n/)
  const blocks: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index].trim()
    if (!line) {
      index += 1
      continue
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line)
    if (heading) {
      const level = heading[1].length
      const content = renderInline(heading[2])
      const Heading = level === 1 ? "h1" : level === 2 ? "h2" : "h3"
      blocks.push(
        <Heading key={index} className={level === 1 ? "text-2xl font-bold leading-tight" : level === 2 ? "border-b border-gray-200 pb-2 text-xl font-semibold" : "text-lg font-semibold"}>
          {content}
        </Heading>,
      )
      index += 1
      continue
    }

    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line)
      const items: ReactNode[] = []
      while (index < lines.length) {
        const itemLine = lines[index].trim()
        const match = ordered ? /^\d+\.\s+(.+)$/.exec(itemLine) : /^[-*]\s+(.+)$/.exec(itemLine)
        if (!match) break
        items.push(<li key={index} className="pl-1">{renderInline(match[1])}</li>)
        index += 1
      }
      const List = ordered ? "ol" : "ul"
      blocks.push(<List key={`list-${index}`} className={ordered ? "list-decimal space-y-2 pl-6" : "list-disc space-y-2 pl-6"}>{items}</List>)
      continue
    }

    const paragraphLines = [line]
    index += 1
    while (index < lines.length && lines[index].trim() && !/^#{1,3}\s+/.test(lines[index].trim()) && !/^[-*]\s+/.test(lines[index].trim()) && !/^\d+\.\s+/.test(lines[index].trim())) {
      paragraphLines.push(lines[index].trim())
      index += 1
    }
    blocks.push(
      <p key={`paragraph-${index}`} className="text-text-muted">
        {paragraphLines.map((paragraphLine, lineIndex) => (
          <Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            {renderInline(paragraphLine)}
          </Fragment>
        ))}
      </p>,
    )
  }

  return blocks
}

export function PoliticaTratamientoDatosPage() {
  return (
    <article className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm sm:p-10">
      <Link to="/personal" className="mb-6 inline-flex text-sm font-medium text-primary underline underline-offset-4">
        Volver a empleados
      </Link>
      <div className="space-y-5 text-sm leading-7 text-text sm:text-base">
        {renderPolicy(politicaMarkdown)}
      </div>
    </article>
  )
}
