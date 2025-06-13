declare module 'md-to-adf' {
  // Type definitions for ADF nodes
  export type MarkType = 'strong' | 'em' | 'code' | 'link';

  export interface ADFNode {
    type: string;
    attrs?: Record<string, unknown>;
    content?: ADFNode[];
    text?: string;
    marks?: { type: MarkType; attrs?: unknown }[];
  }
  export default function markdownToAdf(markdown: string): ADFNode;
}
