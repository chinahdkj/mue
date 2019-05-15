import {addClass, setStyle, removeClass} from "../../src/utils/dom";

export default {
    name: "popover",
    bind(el, binding, vnode){
        addClass(el, "mue-popover__reference");

        el.POPOVER_EVENTS = (e) => {
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
                let func = binding.value;
                typeof func === "function" && func(el);
                pop.handleClick();
                pop.doToggle();
                return;
            }

            if(pop && pop.showPopper){
                setStyle(document.getElementById(pop.tooltipId), "display", "none");
                pop.showPopper = false;
                pop.doDestroy();
            }
            vnode.context.$nextTick(() => {
                let func = binding.value;
                typeof func === "function" && func(el);
                pop.reference = pop.referenceElm = el;
                pop.showPopper = true;
            });

        };

        el.addEventListener("touchend", el.POPOVER_EVENTS);
    },
    unbind(el){
        removeClass(el, "mue-popover__reference");
        el.removeAttribute("aria-describedby");
        el.removeEventListener("touchend", el.POPOVER_EVENTS);
    }
};