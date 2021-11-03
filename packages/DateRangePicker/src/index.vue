<template>
    <div :class="bar ? 'mue-date-range-picker' : 'mue-date-range-picker-input'">

        <div class="pick-bar" v-if="bar">
            <van-icon name="arrow-left" @click.stop="onClickArrow('previous')"/>
            <a @click="showPop" v-html="begin + '&nbsp;~&nbsp;' + end"></a>
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
            <van-datetime-picker v-if="step == 'begin'" :type="dtype" v-model="bv"
                                 :title="t('mue.dateRangePicker.start')" @confirm="onConfirmBegin" v-bind="pickerOps"
                                 @cancel="onCancel" :cancel-button-text="cancelText"/>
            <van-datetime-picker v-if="step == 'end'" :type="dtype" v-model="ev"
                                 :title="t('mue.dateRangePicker.end')" v-bind="pickerOpts2" @confirm="onConfirmEnd"
                                 @cancel="onCancel" :cancel-button-text="cancelText"/>
        </van-popup>
    </div>
</template>

<script>
    import {GetType} from "../../DatePicker/src/utils";

    import {localeMixin, t} from "../../../src/locale";

    export default {
        name: "MueDateRangePicker",
        mixins: [localeMixin],
        inheritAttrs: false,
        inject: {
            FORM_ITEM: {
                from: "FORM_ITEM",
                default(){
                    return {};
                }
            }
        },
        components: {},
        props: {
            format: {
                type: String, default: "YYYY-MM-DD"
            },
            bar: {
                type: Boolean, default: false
            },
            value: {type: String, default: ""},
            begin: {type: String, default: ""},
            end: {type: String, default: ""},
            clearable: {type: Boolean, default: false},
            minDate: {default: null},
            maxDate: {default: null},
            placeholder: {type: String, default: ""},
            disabled: {type: Boolean, default: false},
        },
        data(){
            return {
                pop: false,
                step: "begin",
                bv: null,
                ev: null
            };
        },
        computed: {
            dtype(){
                return GetType(this.format);
            },
            cancelText(){
                return !this.bar && this.clearable ? 
                            t('mue.common.clear') : t('mue.common.cancel');
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
            },
            pickerOpts2(){
                return {...this.pickerOps, minDate: this.bv};
            }
        },
        watch: {
            value: {
                immediate: true, handler(v) {
                    if(!v) {
                        this.$emit("update:begin", "");
                        this.$emit("update:end", "");
                        return
                    }

                    let range = v.split(",");
                    this.$emit("update:begin", range[0]);
                    this.$emit("update:end", range[1]);
                }
            },
            pop(v){
                if(!v){
                    return;
                }
                this.step = "begin";
                if(this.dtype === "time"){
                    this.bv = this.begin;
                    this.ev = this.end;
                }
                else{
                    this.bv = (this.value ? moment(this.begin, this.format) : moment()).toDate();
                    this.ev = (this.value ? moment(this.end, this.format) : moment()).toDate();
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
            onConfirmBegin(v){
                this.bv = v;
                this.step = "end";
            },
            onConfirmEnd(v){
                this.ev = v;
                this.pop = false;
                this.step = "begin";
                let bv, ev;
                if(this.dtype === "time"){
                    bv = this.bv;
                    ev = this.ev;
                }
                else{
                    bv = moment(this.bv).format(this.format);
                    ev = moment(this.ev).format(this.format);
                }
                this.$emit("update:begin", bv);
                this.$emit("update:end", ev);
                this.$emit("confirm", bv, ev);
                this.$emit("input", [bv, ev].join(","))
            },
            onClickArrow(act){
                this.$emit("arrow", act);
            },
            onCancel(){
                if(!this.bar && this.clearable){
                    this.$emit("update:begin", "");
                    this.$emit("update:end", "");
                    this.$emit("confirm", "", "");
                    this.$emit("input", "")
                }
                this.pop = false;
            }
        }
    }
</script>
