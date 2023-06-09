import Vue from 'vue';
import {PopupManager} from './popup';

import Popper from './popper';
import uuid from './uuid';
import {once, setStyle} from './dom';

const PopperJS = Vue.prototype.$isServer ? () => {
} : Popper;

// const PopperJS = Vue.prototype.$isServer ? () => {
// } : require('./popper');
// const stop = e => e.stopPropagation();

/**
 * @param {HTMLElement} [reference=$refs.reference] - The reference element used to position the popper.
 * @param {HTMLElement} [popper=$refs.popper] - The HTML element used as popper, or a configuration used to generate the popper.
 * @param {String} [placement=button] - Placement of the popper accepted values: top(-start, -end), right(-start, -end), bottom(-start, -end), left(-start, -end)
 * @param {Number} [offset=0] - Amount of pixels the popper will be shifted (can be negative).
 * @param {Boolean} [visible=false] Visibility of the popup element.
 * @param {Boolean} [visible-arrow=false] Visibility of the arrow, no style.
 */

const DISABLE_TOUCH = (e) => {
    e.preventDefault();
    e.stopPropagation();
};

export default {
    props: {
        transformOrigin: {
            type: [Boolean, String],
            default: true
        },
        placement: {
            type: String,
            default: 'bottom'
        },
        boundariesPadding: {
            type: Number,
            default: 5
        },
        // reference: {},
        popper: {},
        offset: {
            default: 0
        },
        value: Boolean,
        visibleArrow: Boolean,
        arrowOffset: {
            type: Number,
            default: 35
        },
        appendToBody: {
            type: Boolean,
            default: false
        },
        popperOptions: {
            type: Object,
            default(){
                return {
                    gpuAcceleration: false
                };
            }
        },
        overlay: {
            type: Boolean, default: false
        }
    },

    data(){
        return {
            showPopper: false,
            currentPlacement: '',
            reference: null,
            overlayElm: null,
            tooltipId:`mue-popover-${uuid(10, 20)}`,
            zindex: 0
        };
    },

    watch: {
        value: {
            immediate: true,
            handler(val){
                this.showPopper = val;
                this.$emit('input', val);
            }
        },

        showPopper(val){
            if(this.disabled){
                return;
            }
            if(val){
                this.updatePopper();
            }
            else{
                this.destroyPopper();
            }
            this.$emit('input', val);
        }
    },

    methods: {
        createPopper(){
            if(this.$isServer){
                return;
            }
            this.currentPlacement = this.currentPlacement || this.placement;
            if(!/^(top|bottom|left|right)(-start|-end)?$/g.test(this.currentPlacement)){
                return;
            }

            const options = this.popperOptions;
            const popper = this.popperElm = this.popperElm || this.popper || this.$refs.popper;
            let reference = this.referenceElm =
                this.referenceElm || this.reference || this.$refs.reference;

            if(!reference &&
                this.$slots.reference &&
                this.$slots.reference[0]){
                reference = this.referenceElm = this.$slots.reference[0].elm;
            }

            if(!popper || !reference){
                return;
            }
            if(this.visibleArrow){
                this.appendArrow(popper);
            }
            if(this.appendToBody){
                document.body.appendChild(this.popperElm);

                // let overlay = document.createElement("div");
                // addClass(overlay, "van-overlay");
                // setStyle(overlay, "display", "block");
                // setStyle(overlay, "z-index", PopupManager.nextZIndex());
                // if(!this.overlay){
                //     setStyle(overlay, "background", "transparent");
                // }
                // document.body.appendChild(overlay);
                // on(overlay, "touchmove", DISABLE_TOUCH);
                // this.overlayElm = overlay;
            }



            if(this.popperJS && this.popperJS.destroy){
                this.popperJS.destroy();
            }

            options.placement = this.currentPlacement;
            options.offset = this.offset;
            options.arrowOffset = this.arrowOffset;
            this.popperJS = new PopperJS(reference, popper, options);
            this.popperJS.onCreate(_ => {
                this.$emit('created', this);
                this.resetTransformOrigin();
                this.$nextTick(this.updatePopper);
            });
            if(typeof options.onUpdate === 'function'){
                this.popperJS.onUpdate(options.onUpdate);
            }
            this.zindex = PopupManager.nextZIndex();
            this.popperJS._popper.style.zIndex = this.zindex;
            // this.popperElm.addEventListener('click', stop);
        },

        updatePopper(){
            const popperJS = this.popperJS;
            if(popperJS){
                // setStyle(this.overlayElm, "display", "block");
                popperJS.update();
                if(popperJS._popper){
                    // setStyle(this.overlayElm, "z-index", PopupManager.nextZIndex());
                    this.zindex = PopupManager.nextZIndex();
                    popperJS._popper.style.zIndex = this.zindex;
                }
            }
            else{
                this.createPopper();
            }
            let modal = PopupManager.openModal(this.tooltipId, this.zindex - 1,
                this.appendToBody ? undefined : this.popperElm,
                this.overlay ? "mue-popover-modal-dark" : "mue-popover-modal", false);

            if(!this.appendToBody){
                let bound = this.$el.parentElement.getBoundingClientRect();
                setStyle(modal, "top", bound.top + "px");
                setStyle(modal, "width", bound.width + "px");
                setStyle(modal, "height", bound.height + "px");
                setStyle(modal, "left", bound.left + "px");
            }
            setTimeout(()=>{
                once(modal, "click", (e) => {
                    this.showPopper = false;
                    e.stopPropagation();
                    e.preventDefault();
                });
            }, 50);
        },

        doDestroy(forceDestroy){
            /* istanbul ignore if */
            if(!this.popperJS || (this.showPopper && !forceDestroy)){
                return;
            }
            PopupManager.closeModal(this.tooltipId);
            // if(this.overlayElm){
            //     off(this.overlayElm, "touchmove", DISABLE_TOUCH);
            //     this.overlayElm.parentNode.removeChild(this.overlayElm);
            //     this.overlayElm = null;
            // }
            this.popperJS.destroy();
            this.popperJS = null;
        },

        destroyPopper(){
            if(this.popperJS){
                this.resetTransformOrigin();
            }
        },

        resetTransformOrigin(){
            // setStyle(this.overlayElm, "display", "none");
            if(!this.transformOrigin){
                return;
            }
            let placementMap = {
                top: 'bottom',
                bottom: 'top',
                left: 'right',
                right: 'left'
            };
            let placement = this.popperJS._popper.getAttribute('x-placement').split('-')[0];
            let origin = placementMap[placement];
            this.popperJS._popper.style.transformOrigin = typeof this.transformOrigin === 'string'
                                                          ? this.transformOrigin
                                                          : ['top', 'bottom'].indexOf(placement) >
                                                            -1 ? `center ${origin}`
                                                               : `${origin} center`;
        },

        appendArrow(element){
            let hash;
            if(this.appended){
                return;
            }

            this.appended = true;

            for(let item in element.attributes){
                if(/^_v-/.test(element.attributes[item].name)){
                    hash = element.attributes[item].name;
                    break;
                }
            }

            const arrow = document.createElement('div');

            if(hash){
                arrow.setAttribute(hash, '');
            }
            arrow.setAttribute('x-arrow', '');
            arrow.className = 'popper__arrow';
            element.appendChild(arrow);
        }
    },

    beforeMount(){
        PopupManager.register(this.tooltipId, this);
    },

    beforeDestroy(){
        PopupManager.closeModal(this.tooltipId);
        PopupManager.deregister(this.tooltipId);
        this.doDestroy(true);
        if(this.popperElm && this.popperElm.parentNode === document.body){
            // this.popperElm.removeEventListener('click', stop);
            document.body.removeChild(this.popperElm);
        }
        // if(this.overlayElm){
        //     off(this.overlayElm, "touchmove", DISABLE_TOUCH);
        //     this.overlayElm.parentNode.removeChild(this.overlayElm);
        //     this.overlayElm = null;
        // }
    },

    // call destroy in keep-alive mode
    deactivated(){
        this.$options.beforeDestroy[0].call(this);
    }
};
