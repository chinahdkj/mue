<template>
    <div>
        <mue-popover placement="bottom" v-model="vis">
            <van-button style="margin:50px;" slot="reference" type="primary">打开</van-button>
            <div style="padding: 10px 20px;">
                <van-button type="primary" @click="vis = false">关闭</van-button>
            </div>
        </mue-popover>
    </div>
</template>

<script>
    export default {
        name: "popover",
        components: {},
        data(){
            return {vis: false};
        },
        methods: {
        }
    }
</script>
