import { createFiber } from "./ReactFiber";
import { isArray, isStringOrNumber, updateNode } from "./utils";


export function updateFunctionComponent(workInProgress) {
    const { type, props } = workInProgress;
    const children = type(props);
    // console.log('func', '---->', children)
    reconcileChildren(workInProgress, children);
}

export function updateClassComponent(workInProgress) {
    const { type, props } = workInProgress;
    const instance = new type(props);
    const children = instance.render();
    // console.log('class', '---->', children)
    reconcileChildren(workInProgress, children);
}

export function updateHostComponent(workInProgress) {
    if (!workInProgress.stateNode) {
        workInProgress.stateNode = document.createElement(workInProgress.type);
        // console.log(workInProgress.stateNode)
        updateNode(workInProgress.stateNode, workInProgress.props);
    }
    reconcileChildren(workInProgress, workInProgress.props.children);
}

export function updateHostText(workInProgress) {
    workInProgress.stateNode = document.createTextNode(workInProgress.props.children);
}

export function updateFragmentComponent(workInProgress) {
    reconcileChildren(workInProgress, workInProgress.props.children);
}

function reconcileChildren(workInProgress, children) {
    if (isStringOrNumber(children)) {
        return;
    }
    let previousNewFiber = null;
    const newChildren = isArray(children) ? children : [children];
    for (let index = 0; index < newChildren.length; index++) {
        const newChild = newChildren[index];
        if (newChild === null) {
            continue;
        }
        const newFiber = createFiber(newChild, workInProgress);
        if (previousNewFiber === null) {
            workInProgress.child = newFiber;
        } else {
            previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
    }
}