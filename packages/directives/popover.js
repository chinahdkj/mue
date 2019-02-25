import {addClass, setStyle} from '../../src/utils/dom';

export default {
    name: "popover",
    bind(el, binding, vnode){

        let pop = binding.arg;
        pop = vnode.context.$refs[pop];
        if(Array.isArray(pop)){
            pop = pop[0];
        }
        if(!pop){
            return;
        }

        addClass(el, 'mue-popover__reference');
        el.setAttribute('aria-describedby', pop.tooltipId);

        el.POPOVER_EVENTS = (e) => {
            if(pop.reference === el){
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

        el.addEventListener("click", el.POPOVER_EVENTS);
    },
    unbind(el){
        el.removeEventListener("click", el.POPOVER_EVENTS);
    }
};