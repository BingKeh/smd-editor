type BlockType = "ATX_HEADINGS" | "BLANK_LINE" | "THEMATIC_BREAKS" | "SETTEXT_HEADING" | "CODE_BLOCK" | "PARAGRAPH" | "LIST" | "ROOT";
type InlineType = "Bold" | "Text" | "Emphasis" | "InlineCode";

interface SyntaxNode {
    type: string,
    children: MySyntaxNode[],
    closed: boolean,

    _index?: number,
    _parent?: MySyntaxNode,
    _source?: string,

}

class BlockNode implements SyntaxNode {
    type: string;
    children: MySyntaxNode[];
    closed: boolean;

    constructor(type: BlockType) {
        this.type = type;
        this.children = [];
        this.closed = false;
    }
}