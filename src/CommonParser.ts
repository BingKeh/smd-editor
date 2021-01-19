import _, { head } from 'lodash';
import fs from 'fs';

const log = (s :any) => {
    console.log(s);
}

const assert = (valid: boolean, msg: string) => {
    if (valid) return;
    throw new Error(msg);
}

const cDASH = '-';
const cSTAR = '*';
const cUNDER_SCORE = '_';
const cEQUAL = '=';
const cHASH = '#';

const ATX_HEADING_REGEX = /^#{1,6} /;
const THEMATIC_BREAKS_REGEX = /^( {0,3})(\*+|\-+|\_+)$/;
const SETTEXT_HEAIDNG = /^\=+|\-+$/;
const CODE_REGEX = /^`{3}/;
const LIST_REGEX = /^\s*(\*|\-) /;


class MDIterator {
    text: string;
    lines: string[];
    length: number;

    private _index: number = -1;

    constructor(text: string) {
        this.text = text.replace(/\r\n|\r/, '\n');
        this.lines = text.split("\n");
        this.length = this.lines.length;
    }

    hasNext() :boolean {
        return this._index + 1 < this.length;
    }

    next(): string {
        // max index exceed
        assert(this.hasNext(), "no more lines");
        return this.lines[++this._index];
    }

    peek(): string {
        // max index exceed
        assert(this.hasNext(), "no more lines");
        return this.lines[this._index + 1];
    }

    get(): string {
        return this.lines[this._index];
    }

    index(): number {
        return this._index;
    }
}   

type nodeType = "ATX_HEADINGS" | "BLANK_LINE" | "THEMATIC_BREAKS" | "SETTEXT_HEADING" | "CODE_BLOCK" | "PARAGRAPH" | "LIST" | "ROOT";

interface TokenNode {
    index?: number,
    type: nodeType,
    attr?: string,
    text?: string,
}

function parse(md: string) {
    let it = new MDIterator(md);
    while(it.hasNext()) {
        let line = it.next();
        console.log("parse " + line);
        _parseBlock(line);
        __LIST[__LIST.length - 1].index = it.index();
    }

}

const __LIST: TokenNode[] = [];


function _parseBlock(line: string) {
    let startIndex = 0;
    let forwardIndex = 0;

    let ret;

    // a blank line
    if (line.length === 0) {
        __LIST.push({
            type: "BLANK_LINE",
        })
        return;
    }

    // maybe a heading
    if (ret = line.match(ATX_HEADING_REGEX)) {
        let headLevel = ret[0].length - 1;
        __LIST.push({
            type: "ATX_HEADINGS",
            attr: headLevel + '',
            text: line.substr(headLevel + 1)
        });
        return;
    }

    // maybe a list item
    if (ret = line.match(LIST_REGEX)) {
        let identLevel = ret[0].length - 2;
        __LIST.push({
            type: "LIST",
            attr: identLevel + '',
            text: line.substr(ret[0].length)
        });
        return;
    }
    
    //#region not sure token

    // maybe a thematic break
    if (ret = line.match(THEMATIC_BREAKS_REGEX)) {
        __LIST.push({
            type: "THEMATIC_BREAKS",
        });
        return;
    }

    // maybe a settext heaidng
    if (ret = line.match(SETTEXT_HEAIDNG)) {
        __LIST.push({
            type: "SETTEXT_HEADING",
        });
        return;
    }
    //#endregion

    // maybe a code block
    if (ret = line.match(CODE_REGEX)) {
        let attr;
        if (line.length > 3) {
            attr = line.substr(3);
        }
        __LIST.push({
            type: "CODE_BLOCK",
            attr: attr,
        });
        return;
    }

    console.log(`PARAGRAPHS`);
    __LIST.push({
        type: "PARAGRAPH",
        text: line
    });
}


fs.readFile("./src/test.md", (e, d) => {
    parse(d.toString());

    __LIST.forEach(l => {
        console.log("TOKEN: " + JSON.stringify(l));
    });

    let _n = _parseNode(__LIST);
    console.log(_n);


});

interface DocNode {
    type: nodeType,
    children: DocNode[],
    closed: boolean,

    _index?: number,
    _parent?: DocNode,
    _attr?: string,
}

function getDeepOpen(node: DocNode): DocNode | undefined {
    if (node.closed === true) return;

    if (node.children.length === 0) return node;
    
    // only last children maybe a open
    let _n = getDeepOpen(node.children[node.children.length - 1]);
    if (_n) return _n;

    return;
}

function closeBlock(node: DocNode): DocNode {
    if (node.type === "ROOT" || !node._parent) return node;
    node.closed = true;
    return(closeBlock(node._parent));
}

function pushBlock(parent: DocNode, node: DocNode) {
    let i = parent.children.length;
    let _n: DocNode = {
        ...node,

        _index: i,
        _parent: parent,
    }
    parent.children.push(_n);
}



/**
 * Parse token list
 * @param list 
 */
function _parseNode(list: TokenNode[]) {
    let i = 0;
    let j = 0;

    const doc: DocNode = {
        type: "ROOT",
        children: [],
        closed: false,

        _index: 0,
    };

    let currentNode = doc;

    const _parse = (n: TokenNode) => {
        let type = n.type;
        let _n = getDeepOpen(currentNode);
        if (!_n) return;

        if (type === "ATX_HEADINGS") {
            // close all open Block, util reach root
            _n = closeBlock(_n);
            pushBlock(_n, {
                type: "ATX_HEADINGS",
                closed: false,
                children: [],

                _attr: n.text
            });
            return;
        }

        if (type === "PARAGRAPH") {
            if (!n.text) return;
            if (_n.type === "PARAGRAPH") {
                _n._attr = _n._attr + n.text;
            } else {
                _n = closeBlock(_n);
                pushBlock(_n, {
                    type: 'PARAGRAPH',
                    children: [],
                    closed: false,

                    _attr: n.text
                });
            }
            return;
        }

        if (type === "BLANK_LINE") {
            _n = closeBlock(_n);
            pushBlock(_n, {
                type: "BLANK_LINE",
                closed: false,
                children: []
                
            });
            return;
        }
    }

    for (i; i < list.length; i++) {
        let n = list[i];
        _parse(n);
    }

    return doc;
}



