<template>
    <a class="check-btn" @click="onCheck">
        <i v-if="state === 1" class="fa fa-check-square-o"></i>
        <i v-else-if="state === 0" class="fa fa-square-o"></i>
        <i v-else class="fa fa-minus-square-o"></i>
    </a>
</template>

<script>
    export default {
        props: ["node", "checks"],
        data(){
            return {};
        },
        computed: {
            state(){
                return this.node.GetCheckState(this.checks);
            }
        },
        methods: {
            onCheck(){
                this.$emit("check", this.node, this.state);
            }
        }
    }
</script>