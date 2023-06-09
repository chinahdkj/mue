import Vue from 'vue';
import Loading from './loading.vue';
import {addClass, getStyle, removeClass} from '../../../src/utils/dom';
import {PopupManager} from '../../../src/utils/popup';

const Mask = Vue.extend(Loading);

const loadingDirective = {};
loadingDirective.install = Vue => {
    if(Vue.prototype.$isServer){
        return;
    }
    const toggleLoading = (el, binding) => {
        Vue.nextTick(() => {
            if(binding.value){
                if(binding.modifiers.fullscreen){
                    el.originalPosition = getStyle(document.body, 'position');
                    el.originalOverflow = getStyle(document.body, 'overflow');
                    el.maskStyle.zIndex = PopupManager.nextZIndex();

                    addClass(el.mask, 'is-fullscreen');
                    insertDom(document.body, el, binding);
                }
                else{
                    removeClass(el.mask, 'is-fullscreen');

                    if(binding.modifiers.body){
                        el.originalPosition = getStyle(document.body, 'position');

                        ['top', 'left'].forEach(property => {
                            const scroll = property === 'top' ? 'scrollTop' : 'scrollLeft';
                            el.maskStyle[property] = el.getBoundingClientRect()[property] +
                                document.body[scroll] + document.documentElement[scroll] -
                                parseInt(getStyle(document.body, `margin-${property}`), 10) +
                                'px';
                        });
                        ['height', 'width'].forEach(property => {
                            el.maskStyle[property] = el.getBoundingClientRect()[property] + 'px';
                        });

                        insertDom(document.body, el, binding);
                    }
                    else{
                        el.originalPosition = getStyle(el, 'position');
                        insertDom(el, el, binding);
                    }
                }

            }
            else{
                el.instance.visible = false;
                el.domVisible = false;
            }
        });
    };
    const insertDom = (parent, el, binding) => {
        if(!el.domVisible && getStyle(el, 'display') !== 'none' && getStyle(el, 'visibility') !==
            'hidden'){
            Object.keys(el.maskStyle).forEach(property => {
                el.mask.style[property] = el.maskStyle[property];
            });

            if(el.originalPosition !== 'absolute' && el.originalPosition !== 'fixed'){
                addClass(parent, 'mue-loading-parent--relative');
            }
            if(binding.modifiers.fullscreen && binding.modifiers.lock){
                addClass(parent, 'mue-loading-parent--hidden');
            }
            el.domVisible = true;

            parent.appendChild(el.mask);
            Vue.nextTick(() => {
                el.instance.visible = true;
            });
            el.domInserted = true;
        }
    };

    Vue.directive('loading', {
        bind: function(el, binding, vnode){
            const textExr = el.getAttribute('loading-text');
            const vm = vnode.context;
            const mask = new Mask({
                el: document.createElement('div'),
                data: {
                    text: vm && vm[textExr] || textExr,
                    fullscreen: !!binding.modifiers.fullscreen
                }
            });
            el.instance = mask;
            el.mask = mask.$el;
            el.maskStyle = {};

            binding.value && toggleLoading(el, binding);
        },

        update: function(el, binding){
            el.instance.setText(el.getAttribute('loading-text'));
            if(binding.oldValue !== binding.value){
                toggleLoading(el, binding);
            }
        },

        unbind: function(el, binding){
            if(el.domInserted){
                el.mask &&
                el.mask.parentNode &&
                el.mask.parentNode.removeChild(el.mask);
                toggleLoading(el, {value: false, modifiers: binding.modifiers});
            }
        }
    });
};

export default loadingDirective;