import { Fragment } from "react";
import { parseRichText, type InlineNode } from "@/lib/rich-text";

function Inline({ nodes }: { nodes: InlineNode[] }): React.JSX.Element {
  return <>{nodes.map((node, index) => {
    if (node.kind === "text") return <Fragment key={index}>{node.text}</Fragment>;
    if (node.kind === "strong") return <strong key={index}><Inline nodes={node.children} /></strong>;
    if (node.kind === "em") return <em key={index}><Inline nodes={node.children} /></em>;
    const external = node.href.startsWith("https://");
    return <a key={index} href={node.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}><Inline nodes={node.children} /></a>;
  })}</>;
}

export function RichTextView({ source, className }: { source: string; className?: string }): React.JSX.Element {
  return <div className={className}>{parseRichText(source).map((block, index) => {
    if (block.kind === "heading") return block.level === 2 ? <h2 key={index}><Inline nodes={block.children} /></h2> : <h3 key={index}><Inline nodes={block.children} /></h3>;
    if (block.kind === "quote") return <blockquote key={index}><Inline nodes={block.children} /></blockquote>;
    if (block.kind === "list") {
      const items = block.items.map((item, itemIndex) => <li key={itemIndex}><Inline nodes={item} /></li>);
      return block.ordered ? <ol key={index}>{items}</ol> : <ul key={index}>{items}</ul>;
    }
    return <p key={index}><Inline nodes={block.children} /></p>;
  })}</div>;
}
