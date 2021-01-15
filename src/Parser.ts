type NodeType = "text" | "h1" | "h2" | "h3" | "h4" | "h5" | "italic" | "bold" | "qutoe" | "inline_code" | "code" 

interface MarkDownNode {
    type: NodeType,
    content?: string,
    children?: Array<MarkDownNode>,
}

class ItalicNode implements MarkDownNode {
    type: NodeType = "italic";
    content: string;
    children: Array<MarkDownNode>

    constructor(content: string) {
        this.content = content;
        this.children = new Array<MarkDownNode>();
    }
}

interface SyntaxNode {
    val: string,
    index: number
}

function parserMarkdown(content: string) {
    let syntaxStack = new Array<SyntaxNode>();
    let rootNode: MarkDownNode;

    let startIndex = 0;
    rootNode = {
        type: 'text',
        content: '',
        children: new Array<MarkDownNode>()
    };

    

    // check if valid qutoe
    if (content.slice(0, 2) === '> ') {
        rootNode = {
            type: 'qutoe',
            children: new Array<MarkDownNode>()
        };
        startIndex = 2;
    }




    for (let i = startIndex; i < content.length; i++) {
        let s = content[i];
        
        // italic syntax detected
        if (s === '*' || s === '_') {
            let lastNode = syntaxStack[syntaxStack.length - 1];
            if (lastNode?.val === '*' || lastNode?.val === '_') {
                let _val = content.slice(lastNode.index + 1, i);
                rootNode.children?.push(new ItalicNode(_val));
                syntaxStack.pop();
            } else {
                syntaxStack.push({
                    val: '*',
                    index: i
                });
            }
        }
    }

    return rootNode;
}



function checkHeader(s: string) {
    if (s[0] !== '#') return -1;
    
    let hashCount = 1;
        let i = 1;
        let valid = false;
        do {
            switch(s[i]) {
                case '#': {
                    hashCount++;
                    break;
                }
                case ' ': {
                    valid = true;
                    break;
                }
            } 
            i++;
        } while (!valid && i <= 5);
        if (valid) {
            return hashCount;
        } 
        return -1;
}

let s = "## # fsdfdsdasdasds";
console.log(checkHeader(s));
let index = checkHeader(s);

console.log(`h${index}:${s.slice(index + 1)}`)
