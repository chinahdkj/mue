<template>
    <div class="mue-input">
        <span class="mue-form-text" v-if="FORM_ITEM.readonly">{{value}}
            <span v-if="$slots.suffix" class="input__suffix" style="margin-left: 5px;">
                <slot name="suffix"></slot>
            </span>
        </span>

        <div class="mue-form-input" v-else
             :class="{'has-suffix': icon || $slots.suffix, 'mue-form-input__is-disabled': disabled}">
            <input v-if="readonly" :type="type" class="input__inner" readonly
                   :disabled="disabled" v-model="ipt" :placeholder="placeholder" unselectable="on"
                   onfocus="this.blur()" :maxlength="maxlength"/>

            <input v-else-if="type=='number'||type=='tel'" :type="type" inputmode="numeric" pattern="[0-9]*" oninput="ipt=ipt.replace(/[^0-9.]+/,'');" class="input__inner" :disabled="disabled"
                   v-model="ipt" :placeholder="placeholder" @focus="$emit('focus')"
                   @blur="$emit('blur')" :maxlength="maxlength" :max="max" :min="min"/>

            <input v-else :type="type" class="input__inner" :disabled="disabled"
                   v-model="ipt" :placeholder="placeholder" @focus="$emit('focus')"
                   @blur="$emit('blur')" :maxlength="maxlength"/>

            <span v-if="$slots.suffix" class="input__suffix">
                <slot name="suffix"></slot>
            </span>
            <i class="input__suffix input__suffix_icon" :class="icon"
               v-if="icon" @click="$emit('icon-click')"></i>
            <template v-if="templates.length > 0 && !disabled">
                <a class="mue-input__pop-button" @click.stop="pop = true">
                    <i class="fa fa-file-text-o" aria-hidden="true"></i>
                </a>
                <van-popup ref="pop" class="mue-input__pop" v-model="pop" position="bottom"
                           get-container="body" :close-on-click-overlay="false"
                           @click-overlay="pop = false">
                    <van-picker ref="picker" :columns="templates" show-toolbar @confirm="onConfirm"
                                @cancel="pop = false" value-key="name"/>
                </van-popup>
            </template>
        </div>
    </div>
</template>

<script>
    export default {
        name: "MueInput",
        components: {},
        props: {
            value: {default: null},
            disabled: {type: Boolean, default: false},
            readonly: {type: Boolean, default: false},
            placeholder: {type: String, default: ""},
            icon: {type: String, default: ""},
            type: {type: String, default: "text"},
            templates: {
                type: Array, default(){
                    return [];
                }
            },
            maxlength: {type: [String, Number], default: null},
            max: {type: [String, Number], default: null},
            min: {type: [String, Number], default: null}
        },
        inject: {
            FORM_ITEM: {
                from: "FORM_ITEM",
                default(){
                    return {};
                }
            }
        },
        data(){
            return {
                ipt: "",
                pop: false
            };
        },
        watch: {
            value: {
                immediate: true,
                handler(v){
                    this.ipt = v;
                }
            },
            ipt(v, ov){
                if(this.max&&v>this.max){
                    v=this.max
                    this.ipt=this.max
                }else if(this.min&&v<this.min){
                    v=this.min
                    this.ipt=this.min
                }
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