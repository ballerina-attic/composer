let join;
const tab = '    ';

function times(n, f) {
    let s = '';
    for (let i = 0; i < n; i++) {
        s += f();
    }
    return s;
}

export default function getSourceOf(node, pretty = false, l = 0, replaceLambda) {
    if (!node) {
        return '';
    }
    let i = 0;
    const ws = node.ws ? node.ws.map(wsObj => wsObj.ws) : [];
    const shouldIndent = pretty || !ws.length;

    /**
     * White space generator function,
     * @param {string?} defaultWS
     * @return {string}
     */
    function w(defaultWS) {
        const wsI = ws[i++];
        if (!shouldIndent && wsI !== undefined) {
            return wsI;
        }
        return defaultWS || '';
    }

    function a(afterWS) {
        if (shouldIndent) {
            return afterWS || '';
        }
        return '';
    }

    const b = a;

    function indent() {
        ++l;
        return '';
    }

    function outdent() {
        --l;
        if (shouldIndent) {
            return '\n' + _.repeat(tab, l);
        }
        return '';
    }

    function dent() {
        if (shouldIndent) {
            return '\n' + _.repeat(tab, l);
        }
        return '';
    }

    if (replaceLambda && node.kind === 'Lambda') {
        return '$ function LAMBDA $';
    }

    switch (node.kind) {
        case 'CompilationUnit':
            return join(node.topLevelNodes, pretty, replaceLambda, l, w) + w();
        case 'ArrayType':
            return getSourceOf(node.elementType, pretty, l, replaceLambda) +
                times(node.dimensions, () => w() + '[' + w() + ']');
        // auto gen start
// auto-gen-code
        // auto gen end
        default:
            console.error('no source gen for' + node.kind);
            return '';

    }
}

/**
 * Joins sources of a array of nodes with given delimiters.
 *
 * @private
 * @param {Node[]} arr Nodes to be joined.
 * @param {boolean} pretty
 * @param {number} l indent level.
 * @param {function(number): string} wsFunc White space generator function.
 * @param defaultWS
 * @param {string} separator
 * @param {boolean} suffixLast
 * @param {boolean} replaceLambda
 * @return {string}
 */
join = function (arr, pretty, replaceLambda, l, wsFunc, defaultWS, separator, suffixLast = false) {
    let str = '';
    for (let i = 0; i < arr.length; i++) {
        const node = arr[i];
        if (node.kind === 'Identifier') {
            str += wsFunc(defaultWS);
        }
        str += getSourceOf(node, pretty, l, replaceLambda);
        if (separator && (suffixLast || i !== arr.length - 1)) {
            str += wsFunc(defaultWS) + separator;
        }
    }

    return str;
};
