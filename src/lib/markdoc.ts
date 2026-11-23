import Markdoc, { type Config, type Node } from '@markdoc/markdoc';

// Renders the Markdoc strings that Keystatic stores in YAML fields to HTML at
// build time. Images are not allowed in these fields (galleries hold images).
const config: Config = {
  nodes: {
    link: {
      render: 'a',
      attributes: { href: { type: String }, title: { type: String } },
      transform(node: Node, cfg) {
        const attributes = node.transformAttributes(cfg);
        const href = String(attributes.href ?? '');
        const external = /^https?:\/\//.test(href);
        return new Markdoc.Tag('a', external ? { ...attributes, rel: 'noopener' } : attributes, node.transformChildren(cfg));
      },
    },
  },
};

export function renderMarkdoc(source: string | undefined | null): string {
  if (!source || !source.trim()) return '';
  const ast = Markdoc.parse(source);
  const errors = Markdoc.validate(ast, config).filter((e) => e.error.level === 'critical' || e.error.level === 'error');
  if (errors.length > 0) {
    throw new Error(`Markdoc error: ${errors.map((e) => e.error.message).join('; ')}\n${source.slice(0, 200)}`);
  }
  return Markdoc.renderers.html(Markdoc.transform(ast, config));
}

/** Renders inline Markdoc (one paragraph) without the wrapping <p>. */
export function renderInline(source: string | undefined | null): string {
  return renderMarkdoc(source).replace(/^<p>([\s\S]*)<\/p>\s*$/, '$1');
}
