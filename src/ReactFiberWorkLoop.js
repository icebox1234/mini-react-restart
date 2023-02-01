import { ChildDeletion, Placement, Update } from "./ReactFiberFlags";
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
import { updateNode } from "./utils";

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
    const { stateNode } = workInProgress;
    const parentStateNode = getParentStateNode(workInProgress);
    if (workInProgress.flags & Placement && stateNode) {
        parentStateNode.appendChild(stateNode);
        // workInProgress.flags &= ~Placement;
    }
    if (workInProgress.flags & Update && stateNode) {
        updateNode(stateNode, workInProgress/* .alternate.props, workInProgress.props */);
        // workInProgress.flags &= ~Update;

    }
    if (workInProgress.flags & ChildDeletion) {
        commitDeletion(workInProgress.deletions, stateNode || parentStateNode);
        // workInProgress.flags &= ~ChildDeletion;
    }
    commitWorker(workInProgress.child);
    commitWorker(workInProgress.sibling);
}

function getParentStateNode(workInProgress) {
    let current = workInProgress;
    while (current) {
        const { return: parent } = current;
        if (parent.stateNode) {
            return parent.stateNode;
        }
        current = current.return;
    }
}

function commitDeletion(deletions, parentStateNode) {
    for (let i = 0; i < deletions.length; ++i) {
        parentStateNode.removeChild(getStateNode(deletions[i]));
    }
}

function getStateNode(fiber) {
    while (!fiber.stateNode) {
        fiber = fiber.child;
    }
    return fiber.stateNode;
}


// window.requestIdleCallback(workLoop);
