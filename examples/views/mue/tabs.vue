<template>
    <div>
        <br/>
        <mue-tabs height="300px" v-model="v" @change="onChange">
            <mue-tab v-for="(t, i) in tabs" :title="t.title" :is-more="t.more" :key="i"
                     :icon="t.icon">
                {{t}}
            </mue-tab>
        </mue-tabs>

        <br/>
        <mue-tabs height="300px" v-model="v2" :pop="false" @more-click="moreClick"
                  @click="activeAtMore = false" :active-at-more="activeAtMore">
            <mue-tab title="报表1">
                :pop="false"
                @more-click
            </mue-tab>
            <mue-tab title="报表2">
                :pop="false"
                @more-click
            </mue-tab>
            <mue-tab title="报表3">
                :pop="false"
                @more-click
            </mue-tab>
            <mue-tab title="报表4">
                :pop="false"
                @more-click
            </mue-tab>
            <mue-tab title="报表5">
                :pop="false"
                @more-click
            </mue-tab>
        </mue-tabs>

        <van-popup class="tab-pop" v-model="popVis" position="right" :lazy-render="false">
        </van-popup>
    </div>

</template>

<script>
    export default {
        components: {},
        data(){
            return {
                tabs: [
                    {title: "标签1", more: false, icon: "iconfont icon-baojing"},
                    {title: "标签2", more: false, icon: "iconfont icon-yali"},
                    {title: "标签3", more: false, icon: "iconfont icon-shuizhi"},
                    {title: "标签4", more: false, icon: "iconfont icon-aliuliang"},
                    {title: "标签5", more: true, icon: ""},
                ],
                v: 2,
                v2: 0,
                popVis: false,
                activeAtMore: false,
            };
        },
        methods: {
            onChange(index, title){
                alert([index, title]);
            },
            moreClick(){
                this.popVis = true;
                this.activeAtMore = true;
            }
        },
        mounted(){
        }
    }
</script>
<style lang="less" scoped>
    .tab-pop {
        height: 100%;
        width: 80%;
    }
</style>
