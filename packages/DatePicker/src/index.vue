<template>
    <div :class="bar ? 'mue-date-picker' : 'mue-date-picker-input'">

        <div class="pick-bar" v-if="bar">
            <van-icon name="arrow-left" @click.stop="onClickArrow('previous')"/>
            <a @click="showPop" v-html="value || '&nbsp;&nbsp;&nbsp;&nbsp;'"></a>
            <van-icon name="arrow" @click.stop="onClickArrow('next')"/>
        </div>

        <div class="mue-form-input has-suffix" v-else @click="showPop">
            <input type="text" class="input__inner" readonly :value="value" :disabled="disabled"
                   :placeholder="placeholder" unselectable="on" onfocus="this.blur()"/>
            <i class="input__suffix input__suffix_icon iconfont icon-zhouli"></i>
        </div>

        <van-popup ref="pop" class="mue-date-picker-pop" v-model="pop" position="bottom"
                   get-container="body" :close-on-click-overlay="false"
                   @click-overlay="pop = false">
            <year-picker v-if="dtype == 'year'" v-model="val" @confirm="onConfirm"
                         @cancel="onCancel" :cancel-button-text="cancelText" v-bind="pickerOps"/>
            <van-datetime-picker v-if="dtype != 'year'" :type="dtype" v-model="val"
                                 @confirm="onConfirm" @cancel="onCancel" v-bind="pickerOps"
                                 :cancel-button-text="cancelText"/>
        </van-popup>
    </div>
</template>

<script>
    import {GetType} from "./utils";
    import yearPicker from "./year-picker";

    export default {
        name: "MueDatePicker",
        components: {yearPicker},
        inheritAttrs: false,
        inject: {
            FORM_ITEM: {
                from: "FORM_ITEM",
                default(){
                    return {};
                }
            }
        },
        props: {
            format: {
                type: String, default: "YYYY-MM-DD"
            },
            bar: {
                type: Boolean, default: false
            },
            value: {type: String, default: ""},
            clearable: {type: Boolean, default: false},
            placeholder: {type: String, default: ""},
            disabled: {type: Boolean, default: false},
            minDate: {default: null},
            maxDate: {default: null}
        },
        data(){
            return {
                pop: false,
                val: null
            };
        },
        computed: {
            dtype(){
                return GetType(this.format);
            },
            cancelText(){
                return !this.bar && this.clearable ? "清空" : "取消";
            },
            pickerOps(){
                let opts = {};
                if(this.minDate instanceof Date){
                    opts.minDate = this.minDate;
                }else if(typeof this.minDate === "string"){
                    opts.minDate = moment(this.minDate, this.format).toDate();
                }

                if(this.maxDate instanceof Date){
                    opts.maxDate = this.maxDate;
                }else if(typeof this.maxDate === "string"){
                    opts.maxDate = moment(this.maxDate, this.format).toDate();
                }

                return {...this.$attrs, ...opts};
            }
        },
        watch: {
            pop(v){
                if(!v){
                    return;
                }
                if(this.dtype === "time" || this.dtype === "year"){
                    this.val = this.value;
                }
                else{
                    this.val = (this.value ? moment(this.value, this.format) : moment()).toDate();
                }
            }
        },
        methods: {
            showPop(){
                if(this.disabled || this.FORM_ITEM.readonly){
                    return;
                }
                this.pop = true;
            },
            onConfirm(v){
                this.val = v;
                this.pop = false;
                let val;
                if(this.dtype === "time" || this.dtype === "year"){
                    val = this.val;
                }
                else{
                    val = moment(this.val).format(this.format);
                }
                this.$emit("input", val);
                this.$emit("confirm", val);
            },
            onClickArrow(act){
                !this.disabled && this.$emit("arrow", act);
            },
            onCancel(){
                if(!this.bar && this.clearable){
                    this.$emit("input", "");
                    this.$emit("confirm", "");
                }
                this.pop = false;
            }
        }
    }
</script>
