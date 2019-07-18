<template>
    <div>
        已将vant actionsheet 取消按钮的样式修改。
        由于vant dom结构的原因，如果底部没有取消按钮，需要添加no-cancel样式
        如果需要恢复原来vant默认样式，请添加is-square样式
        <br/>

        <van-button size="small" @click="vis.normal = true" type="primary">默认圆角</van-button>
        <br/>
        <van-button size="small" @click="vis.cancel = true" type="primary">默认圆角，无取消按钮</van-button>
        <br/>
<!--        <van-button size="small" @click="vis.title = true" type="primary">默认圆角，带标题行</van-button>-->
        <br/>
        <van-button size="small" @click="vis.squareNormal = true" type="primary">方形</van-button>
        <br/>
        <van-button size="small" @click="vis.squareCancel = true" type="primary">方形，无取消按钮
        </van-button>
        <br/>
<!--        <van-button size="small" @click="vis.squareTitle = true" type="primary">方形，带标题行</van-button>-->


        <van-actionsheet v-model="vis.normal" :actions="actions" cancel-text="取消" @select="onSelect"
                         get-container="body"/>
        <van-actionsheet class="no-cancel" v-model="vis.cancel" :actions="actions"
                         @select="onSelect" get-container="body"/>
<!--        <van-actionsheet v-model="vis.title" :actions="actions" cancel-text="取消"-->
<!--                         @select="onSelect" get-container="body" title="标题"/>-->


        <van-actionsheet class="is-square" v-model="vis.squareNormal" :actions="actions"
                         cancel-text="取消" @select="onSelect" get-container="body"/>
        <van-actionsheet class="is-square" v-model="vis.squareCancel" :actions="actions"
                         @select="onSelect" get-container="body"/>
<!--        <van-actionsheet class="is-square" v-model="vis.squareTitle" :actions="actions"-->
<!--                         cancel-text="取消" @select="onSelect" get-container="body" title="标题"/>-->
    </div>
</template>

<script>
    export default {
        components: {},
        data(){
            return {
                vis: {
                    normal: false,
                    title: false,
                    cancel: false,

                    squareNormal: false,
                    squareTitle: false,
                    squareCancel: false
                },
                actions: [
                    {name: "操作1"},
                    {name: "操作2", subname: "详细"},
                    {loading: true, name: "加载中", subname: "加载中"},
                    {name: "禁用", disabled: true, subname: "禁用"}
                ]
            };
        },
        methods: {
            onSelect(item, index){
                console.info(item, index);
            }
        }
    };
</script>

<style scoped lang="less">
    .van-button {
        margin-bottom: 10px;
    }
</style>
