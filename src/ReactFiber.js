import { NoFlags, Placement } from "./ReactFiberFlags";
import { FunctionComponent, HostComponent } from "./ReactWorkTags";
import { isFn, isStr } from "./utils";

export function createFiber(vnode, returnFiber) {
    const fiber = {
        type: vnode.type,
        key: vnode.key,
        props: vnode.props,
        stateNode: null,
        child: null,
        sibling: null,
        return: returnFiber,
        flags: Placement,
        index: 0
    };
    const { type } = vnode;
    if (isStr(type)) {
        fiber.tag = HostComponent;
    } else if (isFn(type)) {
        fiber.tag = FunctionComponent;
    }
    return fiber;
}