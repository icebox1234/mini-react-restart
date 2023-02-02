import { isStringOrNumber, isArray } from './utils';
import { createFiber } from './ReactFiber';
import { Update, ChildDeletion, Placement } from './ReactFiberFlags';
// import { Fragment } from './ReactWorkTags';
import { REACT_FRAGMENT_TYPE } from './ReactSymbols';

function reconcileChildren(returnFiber, children) {
    if (isStringOrNumber(children)) {
        return;
    }
    let previousNewFiber = null;
    let newIdx = 0;
    let lastPlacedIndex = 0;
    let nextOldFiber = null;
    let shouldTrackSideEffects = !!returnFiber.alternate;

    const newChildren = isArray(children) ? children : [children];
    const currentFirstChild = returnFiber.alternate?.child;
    let oldFiber = currentFirstChild;

    /**
     * 第一个循环  从头向尾遍历，寻找可复用的fiber节点（比较新旧节点），一旦出现不可复用，就停止
     * old [0 1] 2 3 4
     * new [0 1] 3 4
     */
    for (; oldFiber && newIdx < newChildren.length; newIdx++) {
        let newChild = newChildren[newIdx];
        if (newChild === null) {
            continue;
        }

        if (oldFiber.index > newIdx) {
            nextOldFiber = oldFiber;
            oldFiber = null;
        } else {
            nextOldFiber = oldFiber.sibling;
        }

        if (isArray(newChild)) {
            newChild = { props: { children: newChild }, type: REACT_FRAGMENT_TYPE };
        }


        const same = sameNode(newChild, oldFiber);
        if (!same) {
            if (!oldFiber) {
                oldFiber = nextOldFiber;
            }
            break;
        }
        const newFiber = createFiber(newChild, returnFiber);
        // 相当于useFiber
        Object.assign(newFiber, {
            stateNode: oldFiber.stateNode,
            flags: Update,
            alternate: oldFiber
        });

        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx, shouldTrackSideEffects);

        if (previousNewFiber === null) {
            returnFiber.child = newFiber;
        } else {
            previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
        oldFiber = nextOldFiber;
    }

    /**
     * 第二个循环，会出现两种情况
     * 1.新节点没有了，老节点还在
     * old [0 1] 2 3 4
     * new [0 1]
     * 2.新节点还在，老节点没有了
     * old [0 1] 
     * new [0 1] 2 3 4
     */
    if (newIdx === newChildren.length) {
        deleteRemainingChildren(returnFiber, oldFiber);
    }
    /**
     *  第二种情况，同样适用于初次渲染
     */
    if (!oldFiber) {
        for (/* newIdx = 0 */; newIdx < newChildren.length; newIdx++) {
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
            const newFiber = createFiber(newChild, returnFiber);
            lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx, shouldTrackSideEffects);
            if (previousNewFiber === null) {
                returnFiber.child = newFiber;
            } else {
                previousNewFiber.sibling = newFiber;
            }
            previousNewFiber = newFiber;
        }
    }

    /**
     * 第三个循环，新老节点都存在剩余
     * old 0 1 [2 3 4]
     * new 0 1 [3 4]
     * React中构建old的hashMap
     * Vue中构建的是new的hashMap
     */
    const existingChildren = mapRemainingChildren(returnFiber, oldFiber);

    for (; newIdx < newChildren.length; newIdx++) {
        let newChild = newChildren[newIdx];
        if (newChild === null) {
            continue;
        }

        if (isArray(newChild)) {
            newChild = { props: { children: newChild }, type: REACT_FRAGMENT_TYPE };
        }

        const newFiber = createFiber(newChild, returnFiber);

        const matchedFiber = existingChildren.get(newFiber.key || newFiber.index);
        if (matchedFiber) {
            Object.assign(newFiber, {
                stateNode: matchedFiber.stateNode,
                flags: Update,
                alternate: matchedFiber
            });
            existingChildren.delete(newFiber.key || newFiber.index)
        }

        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx, shouldTrackSideEffects);
        if (previousNewFiber === null) {
            returnFiber.child = newFiber;
        } else {
            previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
    }
    if (shouldTrackSideEffects) {
        existingChildren.forEach(child => {
            deleteChild(returnFiber, child);
        });
    }
}

function sameNode(a, b) {
    return a && b && a.key === b.key && a.type === b.type;
}

function placeChild(newFiber, lastPlacedIndex, newIdx, shouldTrackSideEffects) {
    // newFiber 是 workInProgress 的子fiber节点
    newFiber.index = newIdx;
    if (!shouldTrackSideEffects) {
        return lastPlacedIndex;
    }

    const current = newFiber.alternate;
    if (current) {
        const oldIdx = current.index;
        if (oldIdx < lastPlacedIndex) {
            newFiber.flags |= Placement;
            return lastPlacedIndex;
        } else {
            return oldIdx;
        }
    } else {
        newFiber.flags |= Placement;
        return lastPlacedIndex;
    }

}

function mapRemainingChildren(returnFiber, currentFirstChild) {
    const existingChildren = new Map();
    let existingChild = currentFirstChild;
    while (existingChild) {
        // value 是 key或者index对应的fiber，在Vue中是对应的index，因为Vue中是数组结构
        existingChildren.set(existingChild.key || existingChild.index, existingChild);
        existingChild = existingChild.sibling;
    }
    return existingChildren;
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