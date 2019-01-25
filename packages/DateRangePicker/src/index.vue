<template>
    <div :class="bar ? 'mue-date-range-picker' : 'mue-date-range-picker-input'">

        <div class="pick-bar" @click="pop = true" v-if="bar">
            <span class="pick-bar-content">
                <a v-html="begin + '&nbsp;~&nbsp;' + end"></a>
                <van-icon name="arrow-left" @click.stop="onClickArrow('previous')"/>
                <van-icon name="arrow" @click.stop="onClickArrow('next')"/>
            </span>
        </div>

        <van-popup ref="pop" class="mue-date-picker-pop" v-model="pop" position="bottom"
                   get-container="body">
            <van-datetime-picker v-if="step == 'begin'" :type="dtype" v-model="bv"
                                 title="起始" @confirm="onConfirmBegin"
                                 @cancel="onCancel" :cancel-button-text="cancelText"/>
            <van-datetime-picker v-if="step == 'end'" :type="dtype" v-model="ev"
                                 title="截止" v-bind="pickOpt2" @confirm="onConfirmEnd"
                                 @cancel="onCancel" :cancel-button-text="cancelText"/>
        </van-popup>
    </div>
</template>

<script>
    import {GetType} from '../../DatePicker/src/utils';

    export default {
        name: "MueDateRangePicker",
        components: {},
        props: {
            format: {
                type: String, default: "YYYY-MM-DD"
            },
            bar: {
                type: Boolean, default: false
            },
            begin: {type: String, default: ""},
            end: {type: String, default: ""},
            clearable: {type: Boolean, default: false}
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
                return !this.bar && this.clearable ? "清空" : "取消";
            },
            pickOpt2(){
                if(this.dtype === "time"){
                    return {};
                }
                return {
                    minDate: this.bv
                };
            }
        },
        watch: {
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
            },
            onClickArrow(act){
                this.$emit("arrow", act);
            },
            onCancel(){
                if(!this.bar && this.clearable){
                    this.$emit("update:begin", "");
                    this.$emit("update:end", "");
                    this.$emit("confirm", "", "");
                }
                this.pop = false;
            }
        }
    }
</script>
