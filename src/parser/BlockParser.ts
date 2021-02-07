import _ from 'lodash';

type DocNodeType = "root" | "thematic_breaks";


interface DocumentNode {
    type: DocNodeType,
    closed: boolean,
    
    children: DocumentNode[],
    parent?: DocumentNode,
    next?: DocumentNode,
    prev?: DocumentNode,
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


function parserLine(line: string, root: DocumentNode) {
    // thematic breaks
    const thematic_regex = /^( {0,3})(-+|_+|\*+)[ \t]*$/;

    let _deepNode = getDeepOpenNode(root);
    if (!_deepNode) throw new Error("invalid node");

    if (line.match(thematic_regex)) {
        // 
    }
}