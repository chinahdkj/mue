<template>
    <section class="mue-container" :class="{ 'is-vertical': isVertical }" v-resize="resize">
        <slot></slot>
    </section>
</template>

<script>
    export default {
        name: "MueContainer",
        provide(){
            return {CONTAINER: this};
        },
        props: {
            direction: String
        },
        data(){
            return {
                header: null,
                footer: null,
                main: null
            };
        },
        computed: {
            isVertical(){
                if(this.direction === "vertical"){
                    return true;
                }
                else if(this.direction === "horizontal"){
                    return false;
                }
                return this.$slots && this.$slots.default
                    ? this.$slots.default.some(vnode => {
                        const tag = vnode.componentOptions && vnode.componentOptions.tag;
                        return tag === "mue-header" || tag === "mue-footer";
                    }) : false;
            }
        },
        methods: {
            regFooter(footer){
                this.footer = footer;
                this.resize();
            },
            unregFooter(){
                this.footer = null;
                this.resize();
            },
            regHeader(header){
                this.header = header;
                this.resize();
            },
            unregHeader(){
                this.header = null;
                this.resize();
            },
            regMain(main){
                this.main = main;
                this.resize();
            },
            unregMain(){
                this.main = null;
            },
            resize(){
                this.$nextTick(() => {
                    if(!this.main){
                        return;
                    }
                    let ch = this.$el.getBoundingClientRect().height;
                    let hh = this.header ? this.header.$el.getBoundingClientRect().height : 0;
                    let fh = this.footer ? this.footer.$el.getBoundingClientRect().height : 0;
                    this.main.setHeight(`${ch - hh - fh}px`);
                });
            }
        }
    };
</script>
