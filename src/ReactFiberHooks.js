import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";

let currentlyRenderingFiber = null;
let workInProgressHook = null;

function mountWorkInProgressHook() {
    const hook = {
        memorizedState: null,
        next: null,
        queue: {
            pending: null
        }
    };
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
    } else {
        hook = workInProgressHook.next;
        workInProgressHook = workInProgressHook.next;
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
}

export { useReducer, useState, renderWithHooks };