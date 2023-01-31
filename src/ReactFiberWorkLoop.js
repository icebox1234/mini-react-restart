import { Placement } from "./ReactFiberFlags";
import {
    updateClassComponent,
    updateFragmentComponent,
    updateFunctionComponent,
    updateHostComponent,
    updateHostText
} from "./ReactFiberReconciler";
import {
    ClassComponent,
    Fragment,
    FunctionComponent,
    HostComponent,
    HostText
} from "./ReactWorkTags";
import { schedullCallback } from './Scheduler';

let workInProgress = null;
let workInProgressRoot = null;

function performUnitOfWork() {
    const { tag } = workInProgress;
    switch (tag) {
        case HostComponent:
            updateHostComponent(workInProgress);
            break;
        case FunctionComponent:
            updateFunctionComponent(workInProgress);
            break;
        case ClassComponent:
            updateClassComponent(workInProgress);
            break;
        case Fragment:
            updateFragmentComponent(workInProgress);
            break;
        case HostText:
            updateHostText(workInProgress);
            break;
        default:
            break;
    }
    if (workInProgress.child) {
        workInProgress = workInProgress.child;
        return;
    }
    let next = workInProgress;
    while (next) {
        if (next.sibling) {
            workInProgress = next.sibling;
            return;
        }
        next = next.return;
    }

    workInProgress = null;
}


export function scheduleUpdateOnFiber(fiber) {
    workInProgress = fiber;
    workInProgressRoot = fiber;
    schedullCallback(workLoop);
}

/**
 * 
 * @param {IdleDeadline} IdelDeadline 
 */
function workLoop(/* IdelDeadline */) {
    while (workInProgress /* && IdelDeadline.timeRemaining() > 0 */) {
        performUnitOfWork();
    }
    // console.log(workInProgressRoot)
    if (!workInProgress && workInProgressRoot) {
        commitRoot();
    }
}


function commitRoot() {
    commitWorker(workInProgressRoot);
    console.log(workInProgressRoot)
    workInProgressRoot = null;
}

function commitWorker(workInProgress) {
    if (!workInProgress) {
        return;
    }
    const { flags, stateNode } = workInProgress;
    const parentNode = getParentNode(workInProgress);
    if (flags & Placement && stateNode) {
        parentNode.appendChild(stateNode);
    }
    commitWorker(workInProgress.child);
    commitWorker(workInProgress.sibling);
}

function getParentNode(workInProgress) {
    let current = workInProgress;
    while (current) {
        const { return: parent } = current;
        if (parent.stateNode) {
            return parent.stateNode;
        }
        current = current.return;
    }
}


// window.requestIdleCallback(workLoop);
