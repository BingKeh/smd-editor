import * as MD from "./Node";

// str must startwith key
function findlongestSub(str: string, key: string) {
    if (str[0] !== key) throw new Error("invalid arg");

    let i = 0;
    let valid;
    do {
        valid = str[++i] === key;
    } while(valid && i < str.length);

    return i;
}

function parseInline(md: string) {
    const _list: MD.InlineNode[] = [];

    const pushLineNode = (node: MD.InlineNode, merge: boolean = true) => {
        let _pn = _list.length === 0 ? undefined : _list[_list.length - 1];
        if (!_pn) { _list.push(node); return;}

        // no need to merge, close previous node forcelly
        if (!merge) {
            _pn.close = true;
            _list.push(node);
            return;
        }

        // if previous node is open, append it
        if (!_pn.close) {
            _pn.text += node.text;
        } else {
            _list.push(node);
        }
    }

    const delimiter_regex = /\*|\_\|\[|\!/;
    const delimiter_stack: any[] = [];
    const pushDelimiter = (node: any) => {
        let _pn = delimiter_stack.length === 0 ? undefined : delimiter_stack[delimiter_stack.length - 1];
        if (!_pn) { delimiter_stack.push(node); return; }

        node._prev = _pn;
        _pn._next = node;
        delimiter_stack.push(node);
    }

    let _node: MD.InlineNode;

    // put text node or delimiter node
    for (let i = 0; i < md.length; i++) {
        let s = md[i];
        let _s = md.substr(i);

        // maybe a backslash to escape
        if (s === MD.cBACKSLASH) {
            // followed by a punctuation char, escape it, otherwise treat is as a normal text
            if (MD.punctuation_regex.test(s[i + 1])) {
                pushLineNode({
                    type: "text",
                    text: s[i++],
                    close: false
                });
                continue;
            }
        }

        // maybe a entity and numeric char
        if (s === MD.AND) {
            let r = _s.match(MD.enitity_regex);
            if (r) {
                let _t = r[0].toLowerCase() === '&copy' ? '©' : '@';
                pushLineNode({
                    type: 'text',
                    text: _t,
                    close: false
                });
                i += r[0].length - 1;
                continue;
            }
        }

        // maybe a code span
        if (s === MD.cBACK_TICK) {
            // find next backtick
            let r = _s.match(/^\`.*\`/);

            if (r) {
                let len = r[0].length;
                pushLineNode({
                    type: 'inline_code',
                    text: md.substr(i, len),
                    close: true
                }, false);
                i += len - 1;
                continue;
            } 
        }




        // encounter a delimiter, find all same type delimter until hit NULL
        if (delimiter_regex.test(s)) {

            _node = {
                text: MD.cSTAR,
                close: true
            };

            switch (s) {
                case MD.cSTAR:
                    let len = findlongestSub(_s, MD.cSTAR);
                    pushDelimiter({
                        type: MD.cSTAR,
                        len: len,
                        _lineNode: _node
                    });
                    i += len - 1;
                    pushLineNode(_node, false);
                    break;
                case MD.cUNDER_SCORE:
                    break;
                case MD.cOPEN_SQUARE:
                    break;
                case MD.cECLAMATION:
                        break;
        
                default:
                    break;
            }

            continue;
        }




        _node = {
            text: s,
            close: false
        };

        pushLineNode(_node);
    }

    // try to match delimiter using stack
    for (let i = delimiter_stack.length - 1; i >= 0; i--) {

    }

    return _list;
}

const line = `&copyhoho&commatasus.com`;
let l = parseInline(line);
console.log(l);