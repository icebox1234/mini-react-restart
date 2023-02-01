import { isStringOrNumber, isArray } from './utils';
import { createFiber } from './ReactFiber';

function deleteChild(returnFiber, childFiber) {
    returnFiber.flags |= ChildDeletion;
    let deletions = returnFiber.deletions;
    if (!deletions) {
        deletions = returnFiber.deletions = [];
    }
    deletions.push(childFiber);
}

function reconcileChildren(workInProgress, children) {
    if (isStringOrNumber(children)) {
        return;
    }
    let previousNewFiber = null;
    const newChildren = isArray(children) ? children : [children];
    let currentFiberChild = workInProgress.alternate?.child;
    for (let index = 0; index < newChildren.length; index++) {
        const newChild = newChildren[index];
        if (newChild === null) {
            continue;
        }
        const newFiber = createFiber(newChild, workInProgress);
        const same = sameNode(newFiber, currentFiberChild);
        if (same) {
            Object.assign(newFiber, {
                stateNode: currentFiberChild.stateNode,
                flags: Update,
                alternate: currentFiberChild
            });
        } else if (currentFiberChild) {
            deleteChild(workInProgress, currentFiberChild);
        }
        if (currentFiberChild) {
            currentFiberChild = currentFiberChild.sibling;
        }
        if (previousNewFiber === null) {
            workInProgress.child = newFiber;
        } else {
            previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
    }
}

function sameNode(a, b) {
    return a && b && a.key === b.key && a.type === b.type;
}

export { reconcileChildren };