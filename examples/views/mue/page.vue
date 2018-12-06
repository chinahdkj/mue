<template>
    <mue-page :header-height="40" :footer-height="50">
        <div slot="header" style="background: pink; height: 100%; width: 100%">
            slot="header"
        </div>
        <div style="background: orange; height: 100%; width: 100%">
            header-height 头部区域高度 number<br/>
            footer-height 底部区域高度 number
        </div>
        <div slot="footer" style="background: pink; height: 100%; width: 100%">
            slot="footer"
        </div>
    </mue-page>
</template>

<script>
    export default {
        name: "page",
        components: {},
        data(){
            return {};
        },
        methods: {}
    }
</script>

<style scoped>

</style>