<template>
    <div>
        <mue-tabs height="300px" v-model="v">
            <mue-tab v-for="(t, i) in tabs" :title="t.title" :is-more="t.more" :key="i"
                     :icon="t.icon">
                {{t}}
            </mue-tab>
        </mue-tabs>
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
                v: 2
            };
        },
        methods: {
            onSearch(v){
                this.$toast(v);
            }
        },
        mounted(){
        }
    }
</script>
