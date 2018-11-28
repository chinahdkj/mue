<template>
    <div>
        <van-tabbar v-model="active">
            <van-tabbar-item>
                <span>自定义</span>
                <i slot="icon" class="iconfont icon-gongdan"></i>
            </van-tabbar-item>
            <van-tabbar-item icon="chat" info="3">标签</van-tabbar-item>
            <van-tabbar-item icon="records" dot>标签</van-tabbar-item>
        </van-tabbar>

        <a href="https://youzan.github.io/vant/#/zh-CN/tabbar" target="_blank">配置方法</a>
    </div>
</template>

<script>
    export default {
        components: {},
        data(){
            return {
                active: 0
            };
        },
        methods: {}
    }
</script>

<style>

</style>
