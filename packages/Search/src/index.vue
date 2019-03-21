<template>
    <div class="mue-search">
        <form action="/">
            <van-search v-model="q" background="transparent" show-action
                        :placeholder="placeholder"
                        @search="onSearch">
                <div slot="action" @click="q = ''">取消</div>
            </van-search>
        </form>
    </div>
</template>

<script>
    export default {
        name: "MueSearch",
        components: {},
        props: {
            value: String,
            placeholder: {type: String, default: "请输入搜索关键词"}
        },
        data(){
            return {
                q: "",
            };
        },
        computed: {},
        watch: {
            q(v){
                if(this.value == v){
                    return;
                }
                this.$emit("input", v);
            },
            value: {
                immediate: true,
                handler(v){
                    this.q = v;
                }
            }
        },
        methods: {
            onSearch(){
                this.$emit("search", this.q);
            }
        }
    }
</script>
