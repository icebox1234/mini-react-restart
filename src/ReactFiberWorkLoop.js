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
import { scheduleCallback } from './Scheduler';
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
    scheduleCallback(workLoop);
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
        // parentStateNode.appendChild(stateNode);
        const before = getHostSibling(workInProgress);
        insertOrAppendPlacementNode(workInProgress, before, parentStateNode);
    }
    if (workInProgress.flags & Update && stateNode) {
        updateNode(stateNode, workInProgress);

    }
    if (workInProgress.flags & ChildDeletion) {
        commitDeletion(workInProgress.deletions, stateNode || parentStateNode);
    }

    if (workInProgress.tag === FunctionComponent) {
        invokeHooks(workInProgress);
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

function getHostSibling(fiber) {
    let node = fiber.sibling;
    while (node) {
        if (node.stateNode && !(node.flags & Placement)) {
            return node.stateNode;
        }
        node = node.sibling;
    }
    return null;
}

function insertOrAppendPlacementNode(node, before, parent) {
    if (before) {
        parent.insertBefore(node.stateNode, before);
    } else {
        parent.appendChild(node.stateNode);
    }
}

function invokeHooks(workInProgress) {
    const { updateQueueOfEffect, updateQueueOfLayout } = workInProgress;

    for (let i = 0; i < updateQueueOfLayout.length; i++) {
        const effect = updateQueueOfLayout[i];
        effect.create();
    }

    for (let i = 0; i < updateQueueOfEffect.length; i++) {
        const effect = updateQueueOfEffect[i];

        scheduleCallback(() => {
            effect.create();
        });
    }
}


// window.requestIdleCallback(workLoop);
