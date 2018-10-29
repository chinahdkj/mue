<template>
    <div class="mue-roll-data-group" :class="['is-' + size, {'has-split': split}]">
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: "MueRollDataGroup",
        props: {
            split: Boolean
        },
        components: {},
        data(){
            return {
                size: "large"
            };
        },
        methods: {
            calcSize(){
                let count = this.$slots["default"].filter((vnode) => {
                    return vnode.componentOptions
                        && vnode.componentOptions.tag.toLowerCase() == "mue-roll-data";
                }).length;
                this.size = {2: "normal", 3: "small"}[count] || "large";
            }
        },
        created(){
            this.calcSize();
        }
    }
</script>
