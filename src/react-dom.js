import { createFiber } from "./ReactFiber";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";

function ReactDOMRoot(internalRoot) {
    this._internalRoot = internalRoot;
}

ReactDOMRoot.prototype.render = function (children) {
    // console.log(children);
    const root = this._internalRoot;
    updataContainer(children, root);
}

function updataContainer(element, container) {
    const { containerInfo } = container;
    const fiber = createFiber(element, {
        type: containerInfo.nodeName.toLowerCase(),
        stateNode: containerInfo
    });
    scheduleUpdateOnFiber(fiber);
}

function createRoot(container) {
    const root = {
        containerInfo: container
    };
    return new ReactDOMRoot(root);
}


export default { createRoot };