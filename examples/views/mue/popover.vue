<template>
    <div style="height: 1000px;">
        <mue-popover placement="bottom" v-model="vis">
            <van-button style="margin:50px;" slot="reference" type="primary">打开</van-button>
            <div style="padding: 10px 20px;">
                <van-button type="primary" @click="vis = false">关闭</van-button>
            </div>
        </mue-popover>

        <br/>

        指令模式<br/>
        指令名称为popover；arg为弹出popover的ref值 或者 获得弹出popover的方法，ref查找优先；value为点击弹出按钮时触发的方法，可不绑定；示例
        v-popover:pop="openPop"<br/>
        指令模式的可以多个弹出按钮共用一个popover弹出，能有效降低页面的DOM数量，提高性能。

        <mue-popover ref="pop" placement="bottom" append-to-body overlay>
            <div style="padding: 10px;">{{btn}}</div>
        </mue-popover>

        <van-button style="margin:20px;" type="primary" v-popover:pop="openPop">按钮1</van-button>
        <van-button style="margin:20px;" type="primary" v-popover:getpop="openPop">按钮2
        </van-button>

    </div>
</template>

<script>
    export default {
        name: "popover",
        components: {},
        data(){
            return {vis: false, btn: ""};
        },
        methods: {
            openPop(e){
                this.btn = e.innerText;
            },
            getpop(){
                return this.$refs.pop;
            }
        }
    }
</script>
