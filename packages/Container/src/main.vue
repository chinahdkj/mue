<template>
    <main class="mue-main" :style="{height: height}">
        <slot></slot>
    </main>
</template>

<script>
    export default {
        name: "MueMain",
        inject: {
            CONTAINER: "CONTAINER"
        },
        data(){
            return {height: "100%"};
        },
        methods: {
            setHeight(h){
                this.height = h;
            }
        },
        mounted(){
            this.CONTAINER.regMain(this);
        },
        beforeDestroy(){
            this.CONTAINER.unregMain();
        }
    };
</script>
