<template>
    <footer class="mue-footer" :style="{ height }">
        <slot></slot>
    </footer>
</template>

<script>
    export default {
        name: "MueFooter",
        inject: {
            CONTAINER: "CONTAINER"
        },
        props: {
            height: {
                type: String,
                default: "50px"
            }
        },
        mounted(){
            this.CONTAINER.regFooter(this);
        },
        beforeDestroy(){
            this.CONTAINER.unregFooter();
        }
    };
</script>
