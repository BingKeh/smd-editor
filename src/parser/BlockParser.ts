import _ from 'lodash';

type DocNodeType = "root" | "block_quote" | "thematic_breaks" | "atx_heading" | "settext_heading" | "paragraph" | "blank_line";

const singleNodeType: DocNodeType[] = ["thematic_breaks"];

const block_quote = /^ {0,3}> {0,1}(.*)$/;


interface DocumentNode {
    type: DocNodeType,
    closed: boolean,
    rawText?: string,
    
    children: DocumentNode[],
    parent?: DocumentNode,
    next?: DocumentNode,
    prev?: DocumentNode,

    [propName: string]: any
}

/**
 * find deep open node
 * @param node 
 */
function getDeepOpenNode(node: DocumentNode): DocumentNode | null {
    if (node.closed === true) return null;
    if (_.isEmpty(node.children)) return node;

    for (let i = 0; i < node.children.length; i++) {
        let _ret = getDeepOpenNode(node.children[i]);
        if (_ret) return _ret;
    }

    return node;
}

function closeNode(node: DocumentNode) {
    if (node.type === "root") return node;

    if (node.closed === true) throw new Error("node has been closed!");

    node.closed = false;

    if (!node.parent) throw new Error("parent node required!");
    return node.parent;
}


function readLines(md: string) {
    // replace all \r\n \r to \n
    md = md.replace("\r\n", "\n");
    md = md.replace("\r", "\n");

    let lines = md.split("\n");

    let root: DocumentNode = {
        type: "root",
        children: [],
        closed: false
    }



    for (let i = 0; i < lines.length; i++) {
    }

}

function markNodeForClosable(node: DocumentNode, newNode: DocumentNode, line: string) {
    if (node.type in singleNodeType) return true;

    if (node.type === newNode.type) return false;

    return false;
    
}

function markNodes(node: DocumentNode, newNode: DocumentNode, line: string) {
    let nodes: DocumentNode[] = [];
    while (node.type !== "root") {
        let _r = markNodeForClosable(node, newNode, line);
        if (_r) nodes.push(node);
        if (!node.parent) break;
        node = node.parent;
    }

    return nodes;
}


function parserLine(line: string, root: DocumentNode) {
    // thematic breaks
    const thematic_regex = /^( {0,3})(-+|_+|\*+)[ \t]*$/;

    // atx heading
    const atx_heading = /^ {0,3}(#{1,6}) (.*)$/;

    // settext heading
    const settext_heading = /^ {0,3}(=+|-+) *$/;


    let _node = getDeepOpenNode(root);
    if (!_node) throw new Error("invalid node");

    let _match: RegExpMatchArray | null;

    // check if reamain open



    

    // treat as a paragraph

}