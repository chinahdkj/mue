<template>
    <van-tab>
        <a slot="title" class="mue-tab">
            <i class="mue-tab-icon" v-if="icon" :class="icon"></i>
            <span class="mue-tab-title">{{title}}</span>
        </a>
        <slot></slot>
    </van-tab>
</template>

<script>
    import emitter from "../../../src/mixins/emitter";

    export default {
        name: "MueTab",
        mixins: [emitter],
        props: {
            title: {type: String, default: ""},
            icon: {type: String, default: ""},
            isMore: {type: Boolean, default: false}
        },
        components: {},
        data(){
            return {
                parent: null,
                isActive: false
            };
        },
        watch: {
            isMore(){
                this.parent.toggleTab(this);
            },
            "parent.current": {
                immediate: true,
                handler(v){
                    if(!this.parent){
                        this.isActive = false;
                        return;
                    }
                    let x = this.parent.tabs.indexOf(this);
                    this.isActive = x === v;
                }
            }
        },
        methods: {},
        created(){
            this.parent = this.findParent("mue-tabs");
        },
        mounted(){
            if(!this.parent){
                return;
            }
            this.parent.addTab(this);
        },

        beforeDestroy(){
            if(!this.parent){
                return;
            }
            this.parent.removeTab(this);
        }
    }
</script>
