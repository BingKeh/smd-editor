type BlockType = "ATX_HEADINGS" | "BLANK_LINE" | "THEMATIC_BREAKS" | "SETTEXT_HEADING" | "CODE_BLOCK" | "PARAGRAPH" | "LIST" | "ROOT";
type InlineType = "Bold" | "Text" | "Emphasis" | "InlineCode";

export const punctuation_regex = /(\!)|(\")|(\#)|(\$)|(\%)|(\&)|(\')|(\()|(\))|(\*)|(\+)|(\-)|(\.)|(\/)|(\:)|(\;)|(\<)|(\=)|(\>)|(\?)|(\@)|(\[)|(\\)|(\])|(\^)|(\_)|(\`)|(\{)|(\|)|(\})|(\~)/;

export const cDASH = '-';
export const cSTAR = '*';
export const cUNDER_SCORE = '_';
export const cEQUAL = '=';
export const cHASH = '#';
export const cECLAMATION = '!';
export const cOPEN_SQUARE = '[';
export const cCLOSE_SQUARE = ']';
export const cBACK_TICK = '`';
export const cBACKSLASH = '\\';

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


export interface InlineNode {
    [propName: string]: any
}
