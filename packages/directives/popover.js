import {addClass, removeClass, setStyle} from "../../src/utils/dom";

const createPopEvent = (el, binding, vnode) => {
    return function(e){
        e.stopPropagation();
        e.preventDefault();

        let arg = binding.arg;
        let pop = vnode.context.$refs[arg];

        if(!pop && typeof vnode.context[arg] === "function"){
            pop = vnode.context[arg]();
        }

        if(Array.isArray(pop)){
            pop = pop[0];
        }
        if(!pop){
            return;
        }

        el.setAttribute("aria-describedby", pop.tooltipId);

        if(pop.reference === el){
            pop.handleClick();
            pop.doToggle();
            vnode.context.$nextTick(() => {
                let func = binding.value;
                typeof func === "function" && func(el);
            });
            return;
        }

        if(pop && pop.showPopper){
            setStyle(document.getElementById(pop.tooltipId), "display", "none");
            pop.showPopper = false;
            pop.doDestroy();
        }
        pop.reference = pop.referenceElm = el;
        pop.showPopper = true;
        vnode.context.$nextTick(() => {
            let func = binding.value;
            typeof func === "function" && func(el);
        });
    };

};


export default {
    name: "popover",
    bind(el, binding, vnode){
        addClass(el, "mue-popover__reference");

        el.POPOVER_EVENTS = createPopEvent(el, binding, vnode);

        el.addEventListener("touchend", el.POPOVER_EVENTS);
    },

    componentUpdated(el, binding, vnode){
        el.removeAttribute("aria-describedby");
        el.removeEventListener("touchend", el.POPOVER_EVENTS);

        el.POPOVER_EVENTS = createPopEvent(el, binding, vnode);

        el.addEventListener("touchend", el.POPOVER_EVENTS);
    },

    unbind(el){
        removeClass(el, "mue-popover__reference");
        el.removeAttribute("aria-describedby");
        el.removeEventListener("touchend", el.POPOVER_EVENTS);
    }
};