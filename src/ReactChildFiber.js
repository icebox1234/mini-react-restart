import { isStringOrNumber, isArray } from './utils';
import { createFiber } from './ReactFiber';
import { Update, ChildDeletion } from './ReactFiberFlags';
// import { Fragment } from './ReactWorkTags';
import { REACT_FRAGMENT_TYPE } from './ReactSymbols';

function reconcileChildren(workInProgress, children) {
    if (isStringOrNumber(children)) {
        return;
    }
    let previousNewFiber = null;
    let newIdx = 0;
    let lastPlacedIndex = 0;
    let shouldTrackSideEffects = !!workInProgress.alternate;

    const newChildren = isArray(children) ? children : [children];
    const currentFirstChild = workInProgress.alternate?.child;
    let oldFiber = currentFirstChild;
    if (!oldFiber) {
        for (newIdx = 0; newIdx < newChildren.length; newIdx++) {
            let newChild = newChildren[newIdx];
            if (newChild === null) {
                continue;
            }
            /**
             * 通常情况下child应该是一个对象，但是有时会出现这种情况
             *  <div>
                    {[1, 2, 3, 4].map((item) => {
                        return <span key={item}>{item}</span>;
                    })}
                    {[1, 2, 3, 4].map((item) => {
                        return <span key={item}>{item}</span>;
                    })}
                </div>
    
                此时newChild为一个数组，因此要将newChild加工一下，React的做法是将其变为Fragment的子元素
             */
            if (isArray(newChild)) {
                newChild = { props: { children: newChild }, type: REACT_FRAGMENT_TYPE };
            }
            const newFiber = createFiber(newChild, workInProgress);
            lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx, shouldTrackSideEffects);
            if (previousNewFiber === null) {
                workInProgress.child = newFiber;
            } else {
                previousNewFiber.sibling = newFiber;
            }
            previousNewFiber = newFiber;
        }
    }

    if (newIdx === newChildren.length) {
        deleteRemainingChildren(workInProgress, oldFiber);
    }
}

function sameNode(a, b) {
    return a && b && a.key === b.key && a.type === b.type;
}

function placeChild(newFiber, lastPlacedIndex, newIdx, shouldTrackSideEffects) {
    newFiber.index = newIdx;
    if (!shouldTrackSideEffects) {
        return lastPlacedIndex;
    }
}

function deleteRemainingChildren(returnFiber, currentFirstChild) {
    let childToDelete = currentFirstChild;
    while (childToDelete) {
        deleteChild(returnFiber, childToDelete);
        childToDelete = childToDelete.sibling;
    }
}

function deleteChild(returnFiber, childToDelete) {
    let deletions = returnFiber.deletions;
    if (!deletions) {
        deletions = returnFiber.deletions = [];
        returnFiber.flags |= ChildDeletion;
    }
    deletions.push(childToDelete);
}

export { reconcileChildren };