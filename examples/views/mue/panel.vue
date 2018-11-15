<template>
    <div>
        <mue-panel hairline="wide">
            <div>
                props:<br/>
                title String 标题
                <br/>
                hairline String 顶部边框 可选值none,thin,normal,wide, 默认none<br/>
                none=0px thin=1px normal=4px wide=6px
                <br/>
                slot:<br/>
                tools 头部右侧插槽<br/>

                不设置 title 和 tools 不显示头部
            </div>
        </mue-panel>

        <mue-panel title="自动撑开" hairline="normal">
            <div v-for="i in 10" :key="i"
                 :style="{height: '20px', background: i % 2 == 0 ? 'blue': 'red'}"></div>
        </mue-panel>

        <mue-panel style="height:150px;" title="设置高度" hairline="normal">
            <div v-for="i in 10" :key="i"
                 :style="{height: '20px', background: i % 2 == 0 ? 'blue': 'red'}"></div>
        </mue-panel>

        <mue-panel style="height:150px;" title="带按钮" hairline="normal">
            <van-checkbox v-model="ischart" slot="tools">
                <i slot="icon" slot-scope="props" class="iconfont color-primary"
                   style="font-size: 16px;"
                   :class="props.checked ? 'icon-bianji' : 'icon-ashuifeihuishoushuai'"></i>
            </van-checkbox>
            <div v-for="i in 10" :key="i"
                 :style="{height: '20px', background: i % 2 == 0 ? 'blue': 'red'}"></div>
        </mue-panel>
    </div>

</template>

<script>
    export default {
        components: {},
        data(){
            return {
                ischart: true,
            };
        },
        methods: {}
    }
</script>

<style>

</style>
