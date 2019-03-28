<template>
    <div>
        <br/>
        <mue-tabs height="300px" v-model="v" @change="onChange">
            <mue-tab v-for="(t, i) in tabs" :title="t.title" :is-more="t.more" :key="i"
                     :icon="t.icon">
                {{t}}
            </mue-tab>

            <a style="padding: 10px; font-size: 14px;" slot="suffix" v-popover:pop>排序</a>

        </mue-tabs>

        <mue-popover ref="pop" v-model="sortVis" placement="bottom" :visible-arrow="false"
                     :border-radius="false" popper-class="sort-pop">
            <mue-sort-picker :data="sortData" @change="onSortChange"/>
        </mue-popover>

        <br/>
        <mue-tabs height="300px" v-model="v2" :pop="false" @more-click="moreClick" flex
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
            <mue-search v-model="search" style="padding: 5px;"></mue-search>

            <mue-date-picker/>
        </van-popup>
    </div>

</template>

<script>
    import MueSelect from '../../../packages/Form/select/index';

    export default {
        components: {MueSelect},
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
                sortVis: false,
                activeAtMore: false,
                sortData: [
                    {code: "price", name: "价格"},
                    {code: "sate", name: "状态"},
                    {code: "age", name: "新旧"},
                    {code: "height", name: "高度"},
                    {code: "width", name: "宽度"},
                    {code: "power", name: "功耗"}
                ],
                search: ""
            };
        },
        methods: {
            onChange(index, title){
                alert([index, title]);
            },
            moreClick(){
                this.popVis = true;
                this.activeAtMore = true;
            },
            onSortChange(field, type){
                this.sortVis = false;
                console.info(field, type);
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

    /deep/ .sort-pop {
        width: 100%;
        left: 0 !important;
        padding: 0 10px;
        box-sizing: border-box;
    }
</style>
