import { wrapString } from './util';

type ElementType = "h1" | "h2" | "h3" | "h4" | "h5" | "p" | "code";


/**
 * return a new node, empty content will result a </br> 
 * @param content textContent of node
 * @param type node type
 */
function getNewLine(content: string | null, type: ElementType = "p") {
    const el = document.createElement(type);
    if (content === null || content.trim() === "") {
        el.appendChild(document.createElement('br'));
    } else {
        el.appendChild(document.createTextNode(content));
    }

    el.setAttribute("parsed", "true");
    return el;
}

function parseMarkdown(content: string | null, node: Node) {
    content = wrapString(content);
    if (!content) return getNewLine('');
    content = content.trim();

    let el: HTMLElement;

    const tag = node.parentElement?.tagName;
    if (tag !== 'P' && node.nodeType === Node.TEXT_NODE) {
        // doing some exame here
        return getNewLine(content, tag as ElementType);
    }

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

function removeSelf(node :Node) {
    if (node.nodeType === Node.TEXT_NODE) {
        node.parentNode?.parentNode?.removeChild(node.parentNode);
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
        node.parentNode?.removeChild(node);
    }
}



function init() {
    const editDiv = document.getElementById("editor");
    if (!editDiv) {
        return;
    }

    const range = document.createRange();

    const checkContent = () => {
        if (editDiv.childElementCount === 0) {
            const el = document.createElement('p');
            el.appendChild(document.createElement('br'));
            range.setStart(editDiv, 0);
            range.insertNode(el);
        }
    };

    editDiv.addEventListener('focus', () => checkContent());


    editDiv.addEventListener('keydown', (e: KeyboardEvent) => {
        // always has a p 
        checkContent();

        if (e.code !== 'Enter') return;
        e.preventDefault();

        // get current caret position
        const selection = window.getSelection();

        // get focusNode, could be a text node(3) or element node(1)
        const focusNode = selection?.focusNode;
        if (!focusNode) return;

        const parentNode = focusNode.parentNode;
        if (!parentNode) return;

        let offest = selection?.focusOffset;
        let content = wrapString(focusNode.textContent);
        let textReversed = content.slice(0, offest);
        let textNextLine = content.slice(offest);

        let remainNode = parseMarkdown(textReversed, focusNode);
        let nextNode = parseMarkdown(textNextLine, focusNode);

        range.setStartAfter(parentNode != editDiv ? parentNode : focusNode);
        range.insertNode(remainNode);
        range.setStartAfter(remainNode);
        range.insertNode(nextNode);


        // set range start to new insert node 
        range.setStart(nextNode, 0);
        range.collapse(true);

        selection?.removeAllRanges();
        selection?.addRange(range);

    
        removeSelf(focusNode);
    })




}

document.addEventListener('DOMContentLoaded', () => {
    init();
});