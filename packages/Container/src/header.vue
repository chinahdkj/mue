<template>
    <header class="mue-header" :style="{ height }">
        <slot></slot>
    </header>
</template>

<script>
    export default {
        name: 'MueHeader',
        inject:{
            CONTAINER: "CONTAINER"
        },
        props: {
            height: {
                type: String,
                default: '40px'
            }
        },
        mounted(){
            this.CONTAINER.regHeader(this);
        },
        beforeDestroy(){
            this.CONTAINER.unregHeader();
        }
    };
</script>
