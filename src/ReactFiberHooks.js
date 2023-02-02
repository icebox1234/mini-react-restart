import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";
import { Passive, Layout } from './ReactHookEffectTags';

let currentlyRenderingFiber = null;
let workInProgressHook = null;
let currentHook = null;

function mountWorkInProgressHook() {
    const hook = {
        memorizedState: null,
        next: null,
        queue: {
            pending: null
        }
    };
    currentHook = null;
    if (workInProgressHook === null) {
        currentlyRenderingFiber.memorizedState = hook;
    } else {
        workInProgressHook.next = hook;
    }
    workInProgressHook = hook;
    return workInProgressHook;
}

function updateWorkInProgressHook() {
    const current = currentlyRenderingFiber.alternate;
    currentlyRenderingFiber.memorizedState = current.memorizedState;
    let hook = null;
    if (workInProgressHook === null) {
        workInProgressHook = currentlyRenderingFiber.memorizedState;
        hook = currentlyRenderingFiber.memorizedState;
        currentHook = current.memorizedState;
    } else {
        hook = workInProgressHook.next;
        workInProgressHook = workInProgressHook.next;
        currentHook = currentHook.next;
    }
    return hook;
}

function useReducer(reducer, initialState) {
    let hook = null;
    const current = currentlyRenderingFiber.alternate;
    if (current) {
        hook = updateWorkInProgressHook();
    } else {
        hook = mountWorkInProgressHook();
        hook.memorizedState = initialState;
    }
    // let aaa = currentlyRenderingFiber;
    // const dispatch = (action) => {
    //     hook.memorizedState = reducer(hook.memorizedState, action);
    //     currentlyRenderingFiber.alternate = { ...currentlyRenderingFiber };
    //     scheduleUpdateOnFiber(currentlyRenderingFiber);
    // }
    const dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber, hook, reducer);

    return [hook.memorizedState, dispatch];
}

function useState(initialState) {
    let _initialState;
    if (typeof initialState === 'function') {
        _initialState = initialState();
    } else {
        _initialState = initialState;
    }
    return useReducer(null, _initialState);
}

function updateEffectImpl(flags, create, deps, hook) {

    if (currentHook) {
        const prevEffect = currentHook.memorizedState;
        if (deps) {
            const prevDeps = prevEffect.deps;
            if (areHookInputsEqual(deps, prevDeps)) {
                return;
            }
        }
    }

    const effect = { flags, create, deps };

    hook.memorizedState = effect;

    if (flags & Passive) {
        currentlyRenderingFiber.updateQueueOfEffect.push(effect);
    } else if (flags & Layout) {
        currentlyRenderingFiber.updateQueueOfLayout.push(effect);
    }

}

function mountEffectImpl(flags, create, deps, hook) {
    const effect = { flags, create, deps };

    hook.memorizedState = effect;

    if (flags & Passive) {
        currentlyRenderingFiber.updateQueueOfEffect.push(effect);
    } else if (flags & Layout) {
        currentlyRenderingFiber.updateQueueOfLayout.push(effect);
    }
}

function useEffect(create, deps) {
    let hook = null;
    const current = currentlyRenderingFiber.alternate;
    if (current) {
        hook = updateWorkInProgressHook();
    } else {
        hook = mountWorkInProgressHook();
    }

    if (currentHook) {
        return updateEffectImpl(Passive, create, deps, hook);
    } else {
        return mountEffectImpl(Passive, create, deps, hook);
    }

}

function useLayoutEffect(create, deps) {
    let hook = null;
    const current = currentlyRenderingFiber.alternate;
    if (current) {
        hook = updateWorkInProgressHook();
    } else {
        hook = mountWorkInProgressHook();
    }

    if (currentHook) {
        return updateEffectImpl(Layout, create, deps, hook);
    } else {
        return mountEffectImpl(Layout, create, deps, hook);
    }
}

function dispatchReducerAction(fiber, hook, reducer, action) {
    if (reducer) {
        hook.memorizedState = reducer(hook.memorizedState, action);
    } else {
        if (typeof action === 'function') {
            hook.memorizedState = action(hook.memorizedState);
        } else {
            hook.memorizedState = action;
        }
    }
    fiber.alternate = { ...fiber };
    fiber.sibling = null;
    scheduleUpdateOnFiber(fiber);
}

function renderWithHooks(workInProgress) {
    currentlyRenderingFiber = workInProgress;
    // currentlyRenderingFiber.memorizedState = null;
    workInProgressHook = null;

    currentlyRenderingFiber.updateQueueOfEffect = [];
    currentlyRenderingFiber.updateQueueOfLayout = [];
}

function areHookInputsEqual(nextDeps, prevDeps) {
    if (prevDeps == null) {
        return false;
    }

    for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
        if (Object.is(nextDeps[i], prevDeps[i])) {
            continue;
        }
        return false;
    }

    return true;
}

export { useReducer, useState, useEffect, useLayoutEffect, renderWithHooks };