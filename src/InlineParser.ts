import * as MD from "./Node";

interface DelimiterNode {
    type: "[" | "![" | "*" | "_",
    len: number,
    active: boolean,
    potential: "left" | "right" | "both",

    _prev?: DelimiterNode,
    _next?: DelimiterNode,
    _node: MD.InlineNode,
}

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
            _pn.active = true;
            _list.push(node);
            return;
        }

        // if previous node is open, append it
        if (!_pn.active) {
            _pn.text += node.text;
        } else {
            _list.push(node);
        }
    }

    // for delimiter 
    const delimiter_regex = /\*|\_\|\[|\!/;
    const delimiter_stack: DelimiterNode[] = [];
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
                    active: false
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
                    active: false
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
                    active: true
                }, false);
                i += len - 1;
                continue;
            } 
        }




        // encounter a delimiter, find all same type delimter until hit NULL
        if (delimiter_regex.test(s)) {
            switch (s) {
                case MD.cSTAR: {
                    let len = findlongestSub(_s, MD.cSTAR);
                    let _inlineN: MD.InlineNode = {
                        type: "text",
                        text: MD.cSTAR,
                        active: false,
                    }
                    pushDelimiter({
                        type: MD.cSTAR,
                        len: len,
                        _lineNode: _inlineN
                    });
                    i += len - 1;
                    pushLineNode(_inlineN, false);
                    break;
                }
                case MD.cUNDER_SCORE:
                    break;

                case MD.cOPEN_SQUARE: {
                    let _inlineN: MD.InlineNode = {
                        type: 'text',
                        text: "[",
                        active: false
                    };
                    pushDelimiter({
                        type: "[",
                        len: 1,
                        _lineNode: _inlineN
                    });
                    pushLineNode(_inlineN, false);
                    break;
                } 
                case MD.cECLAMATION:
                        break;
        
                default:
                    break;
            }

            continue;
        }

        // encounter a close square
        if (s === MD.cCLOSE_SQUARE) {
            for (let _i = delimiter_stack.length - 1; _i >= 0; _i--) {
                let _n = delimiter_stack[_i];
                if (_n.type === "![" || _n.type === "[") {
                    // hit but not active, remove it
                    if (!_n.active) {
                        delimiter_stack.splice(_i, 1);
                        break;
                    }

                    // check followed by valid link
                    let _r = _s.match(/^\]\([^\)]+\)/);
                    if (!_r) {
                        delimiter_stack.splice(_i, 1);
                        break;
                    }

                    let link = _r[0].substr(2);
                    _n._node



                }
            }
        }



        _node = {
            type: "text",
            text: s,
            active: false
        };

        pushLineNode(_node);
    }

    // try to match delimiter using stack
    for (let i = delimiter_stack.length - 1; i >= 0; i--) {

    }

    return _list;
}

const line = `hoho[link](http://www.qq.com)666`;
let l = parseInline(line);
console.log(l);