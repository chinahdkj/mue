<template>
    <div class="mue-search" @focus="focus = true" @blur="focus = false"
         :class="{'mue-search__focus': focus}">
        <form action="/">
            <van-search ref="search" v-model="q" background="transparent"
                        :show-action="showAction || q.length > 0"
                        :placeholder="placeholder" @search="onSearch">

                <div class="mue-search-action" slot="action">
                    <slot name="action">
                        <div v-if="actionType === 'search'" @click="onSearch">{{t("mue.common.search")}}</div>
                        <div v-else @click="onCancel">{{t("mue.common.cancel")}}</div>
                    </slot>
                </div>
            </van-search>
        </form>
    </div>
</template>

<script>
    import {localeMixin, t} from "../../../src/locale";

    export default {
        mixins: [localeMixin],
        name: "MueSearch",
        components: {},
        props: {
            value: String,
            placeholder: {
                type: String, default: () => {
                    return t("mue.search.placeholder");
                }
            },
            showAction: {type: Boolean, default: false},
            actionType: {type: String, default: "cancel"}
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
            },
            Focus(){
                let input = this.$refs.search.querySelector("input.van-field__control");
                input.focus();
            },
        }
    };
</script>
