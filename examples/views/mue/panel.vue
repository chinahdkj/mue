<template>
    <div>
        <mue-panel title="自动撑开">
            <div v-for="i in 10" :key="i"
                 :style="{height: '20px', background: i % 2 == 0 ? 'blue': 'yellow'}"></div>
        </mue-panel>

        <mue-panel style="height:150px;" title="设置高度">
            <div v-for="i in 10" :key="i"
                 :style="{height: '20px', background: i % 2 == 0 ? 'blue': 'yellow'}"></div>
        </mue-panel>

        <mue-panel style="height:150px;" title="设置高度">
            <van-checkbox v-model="ischart" slot="tools">
                <i slot="icon" slot-scope="props" class="iconfont color-primary"
                   style="font-size: 16px;"
                   :class="props.checked ? 'icon-bianji' : 'icon-ashuifeihuishoushuai'"></i>
            </van-checkbox>
            <div v-for="i in 10" :key="i"
                 :style="{height: '20px', background: i % 2 == 0 ? 'blue': 'yellow'}"></div>
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
