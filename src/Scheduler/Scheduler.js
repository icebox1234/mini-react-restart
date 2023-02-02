import { peek, pop, push } from "./SchedulerMinHeap";



let taskQueue = [];
let timerQueue = [];
let taskIdCounter = 1;

function scheduleCallback(callback) {
    const currentTime = getCurrentTime();
    let timeout = -1;
    const expirationTime = currentTime + timeout;

    const task = {
        id: taskIdCounter++,
        callback,
        expirationTime,
        sortIndex: -1
    };
    task.sortIndex = expirationTime;
    push(taskQueue, task);

    // replacement of requestIdleCallback
    requestHostCallback();
}

function requestHostCallback(callback) {
    port.postMessage(null);
}

// use MessageChannel because of the 4ms setTimeout clamping.
/**
 * setTimeout(fn, 0)
 * time------>
 * start time 0
 * exec time 1
 * .....
 * exec time 16
 * exec time 20
 * exec time 24
 */
const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = function () {
    workLoop();
}

function workLoop() {
    let currentTask = peek(taskQueue);
    while (currentTask) {
        const callback = currentTask.callback;
        currentTask.callback = null;
        callback();
        pop(taskQueue);
        currentTask = peek(taskQueue);
    }
}

function getCurrentTime() {
    return performance.now();
}


export { scheduleCallback };


