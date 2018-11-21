import Vue from 'vue';
import loadingVue from './loading.vue';
import {addClass, getStyle, removeClass} from '../../../src/utils/dom';
import {PopupManager} from '../../../src/utils/popup';
import merge from '../../../src/utils/merge';

const LoadingConstructor = Vue.extend(loadingVue);

const defaults = {
    text: null,
    fullscreen: true
};

let fullscreenLoading;

LoadingConstructor.prototype.originalPosition = '';
LoadingConstructor.prototype.originalOverflow = '';

LoadingConstructor.prototype.close = function(){
    if(this.fullscreen){
        fullscreenLoading = undefined;
    }
    this.visible = false;
};

const addStyle = (options, parent, instance) => {
    let maskStyle = {};
    if(options.fullscreen){
        instance.originalPosition = getStyle(document.body, 'position');
        instance.originalOverflow = getStyle(document.body, 'overflow');
        maskStyle.zIndex = PopupManager.nextZIndex();
    }
    else if(options.body){
        instance.originalPosition = getStyle(document.body, 'position');
        ['top', 'left'].forEach(property => {
            let scroll = property === 'top' ? 'scrollTop' : 'scrollLeft';
            maskStyle[property] = options.target.getBoundingClientRect()[property] +
                document.body[scroll] +
                document.documentElement[scroll] +
                'px';
        });
        ['height', 'width'].forEach(property => {
            maskStyle[property] = options.target.getBoundingClientRect()[property] + 'px';
        });
    }
    else{
        instance.originalPosition = getStyle(parent, 'position');
    }
    Object.keys(maskStyle).forEach(property => {
        instance.$el.style[property] = maskStyle[property];
    });
};

const Loading = (options = {}) => {
    if(Vue.prototype.$isServer){
        return;
    }
    options = merge({}, defaults, options);
    if(typeof options.target === 'string'){
        options.target = document.querySelector(options.target);
    }
    options.target = options.target || document.body;
    if(options.target !== document.body){
        options.fullscreen = false;
    }
    else{
        options.body = true;
    }
    if(options.fullscreen && fullscreenLoading){
        return fullscreenLoading;
    }

    let parent = options.body ? document.body : options.target;
    let instance = new LoadingConstructor({
        el: document.createElement('div'),
        data: options
    });

    addStyle(options, parent, instance);
    if(instance.originalPosition !== 'absolute' && instance.originalPosition !== 'fixed'){
        addClass(parent, 'mue-loading-parent--relative');
    }
    if(options.fullscreen){
        addClass(parent, 'mue-loading-parent--hidden');
    }
    parent.appendChild(instance.$el);
    Vue.nextTick(() => {
        instance.visible = true;
    });
    if(options.fullscreen){
        fullscreenLoading = instance;
    }
    return instance;
};

export function CloseLoading(){
    fullscreenLoading && fullscreenLoading.close();
}

export default Loading;
