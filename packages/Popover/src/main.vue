<template>
    <span>
        <transition name="van-fade" @after-enter="handleAfterEnter"
                    @after-leave="handleAfterLeave">
            <div class="mue-popover"
                 :class="[popperClass, {'mue-popover-radius': borderRadius}]"
                 :style="width ? {width: typeof width === 'string' ? width : (width + 'px')} : null"
                 ref="popper" v-show="!disabled && showPopper"
                 role="tooltip" :id="tooltipId"
                 :aria-hidden="(disabled || !showPopper) ? 'true' : 'false'">
                <!--<div class="el-popover__title" v-if="title" v-text="title"></div>-->
                <slot>{{ content }}</slot>
            </div>
        </transition>
        <slot name="reference"></slot>
    </span>
</template>
<script>
    import Popper from '../../../src/utils/vue-popper';
    import {addClass, off, on, removeClass} from '../../../src/utils/dom';
    import uuid from '../../../src/utils/uuid';

    export default {
        name: 'MuePopover',

        mixins: [Popper],

        props: {
            // trigger: {
            //     type: String,
            //     default: 'click',
            //     validator: value => ['click', 'focus', 'hover', 'manual'].indexOf(value) > -1
            // },
            // openDelay: {
            //     type: Number,
            //     default: 0
            // },
            // title: String,
            // disabled: Boolean,
            width: {
                type: [Number, String], default: ""
            },
            content: String,
            // reference: {},
            popperClass: String,
            visibleArrow: {
                default: true
            },
            borderRadius: {
                default: true
            },
            arrowOffset: {
                type: Number,
                default: 0
            }
        },
        data(){
            return {
                trigger: "click",
                openDelay: 0,
                disabled: false,
                reference: null
            };
        },
        computed: {
            tooltipId(){
                return `mue-popover-${uuid(10, 20)}`;
            }
        },
        watch: {
            showPopper(val){
                if(this.disabled){
                    return;
                }
                if(val){
                    addClass(document.body, "mue-overlay-show");
                    this.$emit("show");
                }
                else{
                    removeClass(document.body, "mue-overlay-show");
                    this.$emit("hide");
                }
                // val ? this.$emit('show') : this.$emit('hide');
            }
        },

        mounted(){
            let reference = this.referenceElm = this.reference || this.$refs.reference;
            // const popper = this.popper || this.$refs.popper;

            if(!reference && this.$slots.reference && this.$slots.reference[0]){
                reference = this.referenceElm = this.$slots.reference[0].elm;
            }
            // 可访问性
            if(reference){
                addClass(reference, 'mue-popover__reference');
                reference.setAttribute('aria-describedby', this.tooltipId);
                // reference.setAttribute('tabindex', 0); // tab序列
                // popper.setAttribute('tabindex', 0);

                on(reference, 'click', this.handleClick);
                on(reference, 'click', this.doToggle);
            }
            on(document.body, 'click', this.handleDocumentClick);
        },

        methods: {
            doToggle(){
                this.showPopper = !this.showPopper;
            },
            handleClick(){
                removeClass(this.referenceElm, 'focusing');
            },
            handleDocumentClick(e){
                let reference = this.reference || this.$refs.reference;
                const popper = this.popper || this.$refs.popper;

                if(!reference && this.$slots.reference && this.$slots.reference[0]){
                    reference = this.referenceElm = this.$slots.reference[0].elm;
                }
                if(!this.$el ||
                    !reference ||
                    this.$el.contains(e.target) ||
                    reference.contains(e.target) ||
                    !popper ||
                    popper.contains(e.target)){
                    return;
                }
                this.showPopper = false;
            },
            handleAfterEnter(){
                this.$emit('after-enter');
            },
            handleAfterLeave(){
                this.doDestroy();
                this.$emit('after-leave');
            }
        },

        destroyed(){
            const reference = this.reference;

            off(reference, 'click', this.handleClick);
            off(reference, 'click', this.doToggle);
            off(document.body, 'click', this.handleDocumentClick);
        }
    };
</script>
