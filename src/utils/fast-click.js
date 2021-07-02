import FastClick from "fastclick";
import {isIos} from "../lib/common";

const instance = FastClick.attach(document.body);

//处理ios输入框输入聚焦不灵敏问题
FastClick.prototype.focus = function(targetElement) {
    let length;
    //兼容处理:在iOS7中，有一些元素（如date、datetime、month等）在setSelectionRange会出现TypeError
    if (isIos() && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month' && targetElement.type !== 'email') {
        length = targetElement.value.length;
        targetElement.setSelectionRange(length, length);
        //修复bug ios 11.3不弹出键盘，这里加上聚焦代码，让其强制聚焦弹出键盘
        targetElement.focus();
    } else {
        targetElement.focus();
    }
};

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