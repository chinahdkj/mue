<template>
    <div class="demo-loadmore" v-loading="loading">
        <mue-load-more @refresh="onRefresh" @load-more="onLoadMore"
                       :auto-fill="true" :all-loaded="list.length >= 40 ">
            <ul>
                <li v-for="(item, i) in list">{{ i + 1 }}</li>
            </ul>
        </mue-load-more>
    </div>
</template>

<script>
    export default {
        name: "loadmore",
        components: {},
        data(){
            return {list: [], loading: false};
        },
        methods: {
            onRefresh(success){
                let self = this;
                self.loading = true;

                setTimeout(() => {
                    self.list = Array.from({length: 10});
                    self.loading = false;
                    success();
                }, 2000);
            },
            onLoadMore(success){
                let self = this;
                self.loading = true;

                setTimeout(() => {
                    self.list = [...self.list, ...Array.from({length: 10})];
                    self.loading = false;
                    success();
                }, 2000);
            }
        }
    }
</script>

<style scoped lang="less">
    .demo-loadmore {
        height: 400px;
        width: 100%;

        li {
            height: 40px;
            line-height: 40px;
            box-sizing: border-box;
            border-bottom: 1px solid #42b2fa;
        }
    }
</style>