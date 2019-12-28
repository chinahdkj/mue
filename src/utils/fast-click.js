import FastClick from "fastclick";

const instance = FastClick.attach(document.body);

export const ElementClick = (el) => {
    if(!el){
        return;
    }
    if(instance && instance.targetElement){
        instance.targetElement = null;
    }
    let $el = $(el);
    $el.addClass("needsclick");
    $el.trigger("click");
    $el.removeClass("needsclick");
};
export default {ElementClick};
