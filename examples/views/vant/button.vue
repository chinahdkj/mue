<template>
    <div>
        <mue-panel title="默认">
            <van-button size="large">默认按钮</van-button>
            <van-button size="large" square>方形按钮</van-button>
            <van-button size="large" type="primary">默认按钮</van-button>
        </mue-panel>

        <mue-panel title="圆角">
            <van-button round>圆角按钮</van-button>
            <van-button round type="primary">圆角按钮</van-button>
        </mue-panel>

        <mue-panel title="朴素">
            <van-button plain>朴素按钮</van-button>
            <van-button plain type="primary">朴素按钮</van-button>
        </mue-panel>

        <mue-panel title="圆角朴素">
            <van-button plain round>圆角朴素</van-button>
            <van-button plain round type="primary">圆角朴素</van-button>
        </mue-panel>

        <mue-panel title="禁用">
            <van-button disabled>禁用按钮</van-button>
            <van-button disabled round type="primary">禁用按钮</van-button>
        </mue-panel>

        <mue-panel title="mini">
            <van-button size="mini">mini按钮</van-button>
            <van-button size="mini" type="primary">mini按钮</van-button>
            <van-button size="mini" plain>mini按钮</van-button>
            <van-button size="mini" plain type="primary">mini按钮</van-button>
        </mue-panel>

    </div>

</template>

<script>
    export default {
        components: {},
        data(){
            return {};
        },
        methods: {}
    }
</script>

<style>

</style>
