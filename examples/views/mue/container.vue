<template>
    <mue-container>
        <mue-header style="background: pink;"></mue-header>
        <mue-main style="background: orange;">
            弃用此组件，改用meu-page<br/>
            由于低版本IOS浏览器对flex布局兼容性不佳
        </mue-main>
        <mue-footer style="background: pink;"></mue-footer>
    </mue-container>
</template>

<script>
    export default {
        name: "container",
        components: {},
        data(){
            return {};
        },
        methods: {}
    }
</script>

<style scoped>

</style>