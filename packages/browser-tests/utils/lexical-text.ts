type LexicalNode = { text?: string; children?: unknown };

function isLexicalNode(value: unknown): value is LexicalNode {
  return typeof value === 'object' && value !== null;
}

/**
 * Flattens a Payload/Lexical rich-text tree (see `richTextSchema`) down to
 * its plain text, in document order. Loose by design, same philosophy as
 * `richTextSchema` itself — enough to read the rendered copy, not a full
 * Lexical node-type model.
 */
export function extractPlainText(richText: unknown): string {
  const parts: string[] = [];

  function walk(node: unknown): void {
    if (!isLexicalNode(node)) return;
    if (typeof node.text === 'string') parts.push(node.text);
    if (Array.isArray(node.children)) node.children.forEach(walk);
  }

  if (isLexicalNode(richText) && 'root' in richText) {
    walk((richText as { root: unknown }).root);
  }

  return parts.join('');
}
