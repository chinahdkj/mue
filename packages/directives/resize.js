import {addResizeListener, removeResizeListener} from '../../src/utils/resize-event';

export default {
    name: 'resize',
    inserted(el, binding){
        if(typeof binding.value == "function"){
            addResizeListener(el, binding.value);
        }
    },
    unbind(el, binding){
        if(typeof binding.value == "function"){
            removeResizeListener(el, binding.value);
        }

    }
};
