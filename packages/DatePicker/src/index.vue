<template>
    <div :class="bar ? 'mue-date-picker' : 'mue-date-picker-input'">

        <div class="pick-bar" @click="showPop" v-if="bar">
            <span class="pick-bar-content" :class="{'is-disabled': disabled}">
                <a v-html="value || '&nbsp;&nbsp;&nbsp;&nbsp;'"></a>
                <van-icon name="arrow-left" @click.stop="onClickArrow('previous')"/>
                <van-icon name="arrow" @click.stop="onClickArrow('next')"/>
            </span>
        </div>

        <div class="mue-form-input has-suffix" v-else @click="showPop">
            <input type="text" class="input__inner" readonly :value="value" :disabled="disabled"
                   :placeholder="placeholder" unselectable="on" onfocus="this.blur()"/>
            <i class="input__suffix input__suffix_icon iconfont icon-zhouli"></i>
        </div>

        <van-popup ref="pop" class="mue-date-picker-pop" v-model="pop" position="bottom"
                   :lazy-render="false">
            <year-picker v-if="dtype == 'year'" v-model="val" @confirm="onConfirm"
                         @cancel="onCancel" :cancel-button-text="cancelText"></year-picker>
            <van-datetime-picker v-if="dtype != 'year'" :type="dtype" v-model="val"
                                 @confirm="onConfirm" @cancel="onCancel"
                                 :cancel-button-text="cancelText"/>
        </van-popup>
    </div>
</template>

<script>
    import {GetType} from './utils';
    import yearPicker from './year-picker';

    export default {
        name: "MueDatePicker",
        components: {yearPicker},
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
            disabled: {type: Boolean, default: false}
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
                if(!this.disabled){
                    this.pop = true;
                }
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
        },
        mounted(){
            $(this.$refs.pop.$el).appendTo("body");
        }
    }
</script>
