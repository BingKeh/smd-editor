import _ from 'lodash';

type DocNodeType = "root" | "block_quote" | "thematic_breaks" | "atx_heading" | "settext_heading" | "paragraph" | "blank_line";

const singleNodeType: DocNodeType[] = ["thematic_breaks"];


// block quote
const block_quote = /^ {0,3}> {0,1}(.*)$/;

// thematic breaks
const thematic_regex = /^( {0,3})(-+|_+|\*+)[ \t]*$/;

// atx heading
const atx_heading = /^ {0,3}(#{1,6}) (.*)$/;

// settext heading
const settext_heading = /^ {0,3}(=+|-+) *$/;

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

/**
 * check if current node can be marked for close
 * @param node node to be checked
 * @param newNode new node to insert
 * @param line current line
 */
function markNodeForClosable(node: DocumentNode, newNode: DocumentNode, line: string) {
    if (node.type === "block_quote") {
        if (newNode.type === "block_quote") return false;
        return true;
    }

    if (node.type === "thematic_breaks") {
        return true;
    }

    if (node.type === "atx_heading") {
        return true;
    }

    if (node.type === "settext_heading") {
        return true;
    }

    if (node.type === "paragraph") {
        if (newNode.type === "paragraph") return false;
        return true;
    }
    
}

function closeNodes(node: DocumentNode, newNode: DocumentNode, line: string) {
    let nodes: DocumentNode[] = [];
    let _node = node;
    while (_node.type !== "root") {
        let _r = markNodeForClosable(node, newNode, line);

        if (!_r) break;

        nodes.push(_node);
        if (!_node.parent) break;
        _node = _node.parent;
    }

    // check for lazy continuation
    if (newNode.type === "paragraph" && node.type === "block_quote") {
        return;
    }

    return nodes;
}




function parseLine(line: string, root: DocumentNode) {

    let _node = getDeepOpenNode(root);
    if (!_node) throw new Error("invalid node");

    let _match: RegExpMatchArray | null;
    let _newNode: DocumentNode;

    // if current line can be parsed as a block quote
    if (_match = line.match(block_quote)) {
        let level = _match[1].replace(/\s+/, "").length;
        _newNode = {
            type: "block_quote",
            closed: false,
            level: level,

            children: []
        };


        closeNodes(_node, _newNode, line);
        
    }

    

}


