<template>
    <van-tab :disabled="disabled">
        <a slot="title" class="mue-tab">
            <i class="mue-tab-icon" v-if="icon" :class="icon"></i>
            <span class="mue-tab-title">{{title}}</span>
        </a>
        <slot></slot>
    </van-tab>
</template>

<script>

    export default {
        name: "MueTab",
        inject: ["TABS"],
        props: {
            title: {type: String, default: ""},
            icon: {type: String, default: ""},
            isMore: {type: Boolean, default: false},
            disabled: {type: Boolean, default: false}
        },
        components: {},
        data(){
            return {
                isActive: false
            };
        },
        watch: {
            isMore(){
                this.TABS.toggleTab(this);
            },
            "TABS.current": {
                immediate: true,
                handler(v){
                    let x = this.TABS.tabs.indexOf(this);
                    this.isActive = x === v;
                }
            }
        },
        methods: {},
        mounted(){
            this.TABS.addTab(this);
        },

        beforeDestroy(){
            this.TABS.removeTab(this);
        }
    }
</script>
