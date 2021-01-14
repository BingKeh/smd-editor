type ElementType = "h1" | "h2" | "h3" | "h4" | "h5" | "p" | "code";

/**
 * return a new node, empty content will result a </br> 
 * @param content textContent of node
 * @param type node type
 */
function getNewLine(content: string | null, type: ElementType = "p") {
    const p = document.createElement(type);
    if (content === null || content.trim() === "") {
        p.appendChild(document.createElement('br'));
    } else {
        p.appendChild(document.createTextNode(content));
    }
    return p;
}

function parseMarkdon(content: string | null) {
    if (content === null) return getNewLine('');
    content = content.trim();

    // Heading syntax find
    if (content.startsWith('#')) {
        let realVal: string;
        let hashCount = 0;
        let validFlag = false;
        for (let i = 0; i < content.length; i++) {
            // max 5 # exceed
            if (hashCount > 5) {
                break;
            } else if (content[i] === '#') {
                hashCount++;
            } else if (content[i] === ' ') {
                validFlag = true;
                break;
            }
        }

        if (!validFlag) {
            realVal = content;
        } else {
            realVal = content.slice(hashCount);
        }

        return getNewLine(realVal, validFlag ? `h${hashCount}` as ElementType : 'p');
    }



    return getNewLine(content);
}


function init() {
    const editDiv = document.getElementById("editor");
    if (!editDiv) {
        return;
    }

    const range = document.createRange();
    let lastInsertNode: Node;

    editDiv.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.code !== 'Enter') return;
        const selection = window.getSelection();

        // The node pointer point to
        let currentNode = selection?.focusNode;
        if (!currentNode) return;
        
        if (currentNode === editDiv) {
            
            range.setStart(currentNode, selection?.focusOffset as any);
            lastInsertNode = getNewLine("");
            range.insertNode(lastInsertNode);
            e.preventDefault();
            return;
        }

        let val = currentNode.textContent;
        let nodeInsert = parseMarkdon(val);

        // currentNode will be editDiv if first line end with nothing !!
        let parentNode = currentNode === editDiv ? currentNode : currentNode.parentNode;
        if (!parentNode) return;
        
        // Check if the first node in editor, it will be a textNode under the editor node
        if (parentNode === editDiv) {
            range.setStart(editDiv, 0);
            currentNode.textContent = '';
            range.insertNode(nodeInsert);
        } else {
            range.setStartBefore(parentNode);
            range.insertNode(nodeInsert); 
            editDiv.removeChild(parentNode);   
        }


        // Insert new line after enter
        range.setStartAfter(nodeInsert);
        lastInsertNode = getNewLine("");
        range.insertNode(lastInsertNode);
        e.preventDefault();
    })




}

document.addEventListener('DOMContentLoaded', () => {
    init();
});