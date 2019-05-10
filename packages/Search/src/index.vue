<template>
    <div class="mue-search" @focus.native="focus = true" @blur.native="focus = false"
         :class="{'mue-search__focus': focus}">
        <form action="/">
            <van-search v-model="q" background="transparent"
                        :show-action="showAction || q.length > 0"
                        :placeholder="placeholder" @search="onSearch">
                <div slot="action" @click="onCancel">取消</div>
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
            placeholder: {type: String, default: "请输入搜索关键词"},
            showAction: {type: Boolean, default: false}
        },
        data(){
            return {
                q: "",
                focus: false
            };
        },
        computed: {},
        watch: {
            q(v){
                if(this.value === v){
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
            },
            onCancel(){
                this.q = "";
                this.$emit("cancel");
            }
        }
    }
</script>
