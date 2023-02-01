import { NoFlags, Placement } from "./ReactFiberFlags";
import { ClassComponent, Fragment, FunctionComponent, HostComponent, HostText } from "./ReactWorkTags";
import { isFn, isStr, isUndefined } from "./utils";

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
        index: 0,
        alternate: null,
        memorizedState: null
    };
    const { type } = vnode;
    if (isStr(type)) {
        fiber.tag = HostComponent;
    } else if (isFn(type)) {
        fiber.tag = type.prototype.isReactComponent ? ClassComponent : FunctionComponent;
    } else if (isUndefined(type)) {
        fiber.tag = HostText;
        fiber.props = {
            children: vnode
        };
    } else {
        fiber.tag = Fragment;
    }
    return fiber;
}