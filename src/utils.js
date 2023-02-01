import { HostText } from "./ReactWorkTags";

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

export function mountNode(node, workInProgress) {
    const nextVal = workInProgress.props;
    Object.keys(nextVal)
        // .filter(k => k !== "children")
        .forEach((k) => {
            if (k === "children") {
                // 有可能是文本
                if (isStringOrNumber(nextVal[k])) {
                    node.textContent = nextVal[k];
                }
            } else if (k.slice(0, 2) === "on") {
                const eventName = k.slice(2).toLocaleLowerCase();
                node.addEventListener(eventName, nextVal[k]);
            } else {
                node[k] = nextVal[k];
            }
        });
}
/**
 * 关于之前children = ['xxxx','xxx'] 时，视图不更新的问题，主要是发生在updateHostText中，因为scheduleCallback是从这些textNode的
 * 父节点P开始的，所以也为这些节点创建了fiber，这些节点在update的时候，之前由于，没有判断节点否存在，而是直接赋值，导致节点被赋值了一个新的
 * textNode，并且由于此时时更新的flags，所以不会有父节点的DOM节点的appendChild操作，因此这个新创建的textNode节点并没有挂载到父节点的
 * DOM上，所以在此处的更改知识更改了这个没有挂在的textNode节点，在updateHostText中判断节点是否存在，存在的情况下时对其nodeValue
 * 进行更改即可（这种更改就不会更改其DOM节点的父节点了）。
 */
export function updateNode(node, workInProgress) {
    const prevVal = workInProgress.alternate.props;
    const nextVal = workInProgress.props;

    Object.keys(prevVal)
        // .filter(k => k !== "children")
        .forEach((k) => {
            if (k === "children") {

                // 有可能是文本
                if (isStringOrNumber(prevVal[k])) {
                    if (workInProgress.tag === HostText) {
                        node.nodeValue = '';
                        return;
                    }
                    node.textContent = "";
                }
            } else if (k.slice(0, 2) === "on") {
                const eventName = k.slice(2).toLocaleLowerCase();
                node.removeEventListener(eventName, prevVal[k]);
            } else {
                if (!(k in nextVal)) {
                    node[k] = "";
                }
            }
        });

    Object.keys(nextVal)
        // .filter(k => k !== "children")
        .forEach((k) => {
            if (k === "children") {
                // 有可能是文本
                if (isStringOrNumber(nextVal[k])) {
                    if (workInProgress.tag === HostText) {
                        node.nodeValue = nextVal[k];
                        return;
                    }
                    node.textContent = nextVal[k];
                }
            } else if (k.slice(0, 2) === "on") {
                const eventName = k.slice(2).toLocaleLowerCase();
                node.addEventListener(eventName, nextVal[k]);
            } else {
                node[k] = nextVal[k];
            }
        });
}