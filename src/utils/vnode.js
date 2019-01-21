export const deepClone = (vnodes, createElement) => {
    let cloneVNode = (vnode) => {
        let clonedChildren = vnode.children && vnode.children.map((vnode) => {
            return cloneVNode(vnode)
        });
        let cloned = createElement(vnode.tag, vnode.data, clonedChildren);
        cloned.text = vnode.text;
        cloned.isComment = vnode.isComment;
        cloned.componentOptions = vnode.componentOptions;
        cloned.elm = vnode.elm;
        cloned.context = vnode.context;
        cloned.ns = vnode.ns;
        cloned.isStatic = vnode.isStatic;
        cloned.key = vnode.key;
        return cloned;
    }

    let clonedVNodes = vnodes.map((vnode) => {
        return cloneVNode(vnode)
    });
    return clonedVNodes;
};