export function isStr(s) {
    return typeof s === "string";
}

export function isStringOrNumber(s) {
    return typeof s === "string" || typeof s === "number";
}

export function isFn(fn) {
    return typeof fn === "function";
}

export function isArray(arr) {
    return Array.isArray(arr);
}

export function isUndefined(s) {
    return s === undefined;
}

export function updateNode(node, nextVal) {
    Object.keys(nextVal).forEach((k) => {
        if (k === "children") {
            if (isStringOrNumber(nextVal[k])) {
                node.textContent = nextVal[k];
            }
        } else {
            node[k] = nextVal[k];
        }
    });
}