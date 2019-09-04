<template>
    <div class="mue-textarea">
        <span class="mue-form-text" v-if="FORM_ITEM.readonly">{{value}}</span>

        <template v-else>
            <textarea v-if="readonly" class="textarea__inner" v-model="ipt" readonly
                      :disabled="disabled" :placeholder="placeholder" :rows="rows"
                      unselectable="on" onfocus="this.blur()" :maxlength="maxlength"/>
            <textarea v-else class="textarea__inner" v-model="ipt" :readonly="readonly"
                      :disabled="disabled" :placeholder="placeholder" :rows="rows"
                      :maxlength="maxlength"/>

            <template v-if="templates.length > 0 && !disabled">
                <a class="mue-textarea__pop-button" @click.stop="pop = true">
                    <i class="fa fa-file-text-o" aria-hidden="true"></i>
                </a>
                <van-popup ref="pop" class="mue-textarea__pop" v-model="pop" position="bottom"
                           get-container="body" :close-on-click-overlay="false"
                           @click-overlay="pop = false">
                    <van-picker ref="picker" :columns="templates" show-toolbar @confirm="onConfirm"
                                @cancel="pop = false" value-key="name"/>
                </van-popup>
            </template>
        </template>
    </div>
</template>

<script>
    export default {
        name: "MueTextarea",
        components: {},
        props: {
            value: {default: null},
            disabled: {type: Boolean, default: false},
            readonly: {type: Boolean, default: false},
            placeholder: {type: String, default: ""},
            rows: {type: [Number, String], default: 2},
            templates: {
                type: Array, default(){
                    return [];
                }
            },
            maxlength: {type: [String, Number], default: null}
        },
        data(){
            return {
                ipt: "",
                pop: false,
            };
        },
        inject: {
            FORM_ITEM: {
                from: "FORM_ITEM",
                default(){
                    return {};
                }
            }
        },
        watch: {
            value: {
                immediate: true,
                handler(v){
                    this.ipt = v;
                }
            },
            ipt(v, ov){
                this.$emit("input", v);
                this.$emit("change", v, ov);
            }
        },
        methods: {
            onConfirm(){
                this.pop = false;
                let index = this.$refs.picker.getColumnIndex(0);
                let tmpl = this.templates[index] || {};
                this.ipt = tmpl.code || "";
            }
        },
        mounted(){

        }
    }
</script>