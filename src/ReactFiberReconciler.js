import { renderWithHooks } from "./ReactFiberHooks";
import { mountNode } from "./utils";
import { reconcileChildren } from "./ReactChildFiber";


export function updateFunctionComponent(workInProgress) {
    renderWithHooks(workInProgress);
    const { type, props } = workInProgress;
    const children = type(props);
    reconcileChildren(workInProgress, children);
}

export function updateClassComponent(workInProgress) {
    const { type, props } = workInProgress;
    const instance = new type(props);
    const children = instance.render();
    reconcileChildren(workInProgress, children);
}

export function updateHostComponent(workInProgress) {
    if (!workInProgress.stateNode) {
        workInProgress.stateNode = document.createElement(workInProgress.type);
        mountNode(workInProgress.stateNode, workInProgress);
    }
    reconcileChildren(workInProgress, workInProgress.props.children);
}

export function updateHostText(workInProgress) {
    if (!workInProgress.stateNode) {
        workInProgress.stateNode = document.createTextNode(workInProgress.props.children);
    } else if (workInProgress.stateNode.nodeValue !== workInProgress.props.children) {
        workInProgress.stateNode.nodeValue = workInProgress.props.children;
    }
}

export function updateFragmentComponent(workInProgress) {
    reconcileChildren(workInProgress, workInProgress.props.children);
}



