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
            <!-- 数字 浮点数，支持负号 非九宫格-->
            <input v-else-if="type ==='number' && numberType === 'float' && mode !== 'native'" type="text" inputmode="text" @input="getFLOAT" class="input__inner" :disabled="disabled"
                   v-model="ipt" :placeholder="placeholder" @focus="$emit('focus')" @change="onChange"
                   @blur="$emit('blur')" :maxlength="maxlength" :max="max" :min="min"/>
            <!-- 数字 整数，支持负号 非九宫格 -->
            <input v-else-if="type ==='number' && numberType !== 'float' && mode !== 'native'" type="text" inputmode="text" @input="getINTEGER" class="input__inner" :disabled="disabled"
                   v-model="ipt" :placeholder="placeholder" @focus="$emit('focus')" @change="onChange"
                   @blur="$emit('blur')" :maxlength="maxlength" :max="max" :min="min"/>
            <!-- 数字 浮点数，支持负号 九宫格-->
            <input v-else-if="type === 'number' && numberType === 'float' && mode === 'native'" :type="type" inputmode="decimal" oninput="value=value.replace(/[^0-9.]+/,'');" class="input__inner" :disabled="disabled"
                   v-model="ipt" :placeholder="placeholder" @focus="$emit('focus')" @change="onChange"
                   @blur="$emit('blur')" :maxlength="maxlength" :max="max" :min="min"/>
            <!-- 数字 整数，支持负号 九宫格 -->
            <input v-else-if="type === 'number' && numberType !== 'float' && mode === 'native'" :type="type" inputmode="numeric" oninput="value=value.replace(/[^0-9]+/,'');" class="input__inner" :disabled="disabled"
                   v-model="ipt" :placeholder="placeholder" @focus="$emit('focus')" @change="onChange"
                   @blur="$emit('blur')" :maxlength="maxlength" :max="max" :min="min"/>

            <input v-else-if="type === 'tel' && numberType === 'float'" :type="type" inputmode="decimal" oninput="value=value.replace(/[^0-9.]+/,'');" class="input__inner" :disabled="disabled"
                   v-model="ipt" :placeholder="placeholder" @focus="$emit('focus')" @change="onChange"
                   @blur="$emit('blur')" :maxlength="maxlength" :max="max" :min="min"/>
            <input v-else-if="type === 'tel' && numberType !== 'float'" :type="type" inputmode="numeric" oninput="value=value.replace(/[^0-9]+/,'');" class="input__inner" :disabled="disabled"
                   v-model="ipt" :placeholder="placeholder" @focus="$emit('focus')" @change="onChange"
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
                           @click-overlay="pop = false" @close="onPopupClose">
                    <van-picker ref="picker" :columns="tmp" show-toolbar @confirm="onConfirm"
                                @cancel="pop = false" value-key="name">
                        <template #title v-if="templates.length && searchable">
                            <input class="input__search" type="text" v-model="searchValue"
                                   :placeholder="t('mue.common.placeholder')">
                        </template>
                    </van-picker>
                </van-popup>
            </template>
        </div>
    </div>
</template>

<script>
    import {localeMixin, t} from "../../../src/locale";
    export default {
        name: "MueInput",
        mixins: [localeMixin],
        components: {},
        props: {
            value: {default: null},
            disabled: {type: Boolean, default: false},
            readonly: {type: Boolean, default: false},
            placeholder: {type: String, default: ""},
            icon: {type: String, default: ""},
            type: {type: String, default: "text"},
            numberType: {type: String, default: ""},
            mode: {type: String, default: ""},
            templates: {
                type: Array, default(){
                    return [];
                }
            },
            searchable: {type: Boolean, default: false},
            maxlength: {type: [String, Number], default: null},
            max: {type: [String, Number], default: null},
            min: {type: [String, Number], default: null},
            floatLength:{type: [String, Number], default: 0}
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
                pop: false,
                searchValue: "",
                tmp: []
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
                /*if(this.max!=null&&v>this.max&&v){
                    v=this.max
                    this.ipt=this.max
                }else if(this.min!=null&&v<this.min&&v){
                    v=this.min
                    this.ipt=this.min
                }*/
                this.$emit("input", v);
                this.$emit("change", v, ov);
            },
            searchValue: {
                handler(v) {
                    let filterData = this.templates.filter(f => {
                        return f.name.includes(v);
                    })
                    this.tmp = $.extend(true, [], filterData);
                }
            },
            templates: {
                immediate: true, deep: true, handler(v, ov) {
                    if(JSON.stringify(v) === JSON.stringify(ov)) {
                        return
                    }
                    this.tmp = $.extend(true, [], v);
                }
            }
        },
        methods: {
            getFLOAT(e) {
                let val = e.target.value
                const t = val.charAt(0)
                // 先把非数字的都替换掉，除了数字和.
                val = val.replace(/[^\d.]/g, '')
                // 保证只有出现一个.而没有多个.
                val = val.replace(/\.{2,}/g, '.')
                // 必须保证第一个为数字而不是.
                val = val.replace(/^\./g, '')
                // 保证.只出现一次，而不能出现两次以上
                val = val.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
                // 负数处理
                if (t === '-') {
                    e.target.value = '-' + val
                } else {
                    e.target.value = val
                }
                this.ipt = e.target.value
            },
            getINTEGER(e) {
                let val = e.target.value
                const t = val.charAt(0)
                // 先把非数字的都替换掉，除了数字和.
                val = val.replace(/[^0-9]+/g, '')
                // 负数处理
                if (t === '-') {
                    e.target.value = '-' + val
                } else {
                    e.target.value = val
                }
                this.ipt = e.target.value
            },
            onConfirm(){
                this.pop = false;
                let index = this.$refs.picker.getColumnIndex(0);
                let tmpl = this.tmp[index] || {};
                this.ipt = tmpl.code || "";
            },
            onChange(e){
                let v = isNaN(e.target.value) ? 0 : Number(e.target.value)
                if(this.max!=null&&v>this.max&&v){
                    v=this.max
                    this.ipt=this.max
                }else if(this.min!=null&&(v<this.min||v===0)){
                    v=this.min
                    this.ipt=this.min
                }

                if(this.floatLength) {
                    v = parseFloat((v).toFixed(this.floatLength))
                    this.ipt = v;
                }

            },
            onPopupClose() {
                this.searchValue = "";
            }
        },
        mounted(){

        }
    }
</script>
