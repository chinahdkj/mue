<template>
    <div class="mue-date-range-picker">

        <div class="pick-bar" @click="pop = true">
            <span class="pick-bar-content">
                <a>{{begin}} ~ {{end}}</a>
                <van-icon name="arrow-left" @click.stop="onClickArrow('previous')"/>
                <van-icon name="arrow" @click.stop="onClickArrow('next')"/>
            </span>
        </div>

        <van-popup class="mue-date-picker-pop" v-model="pop" position="bottom"
                   :lazy-render="false">
            <van-datetime-picker v-if="step == 'begin'" :type="dtype" v-model="bv"
                                 title="起始" @confirm="onConfirmBegin" @cancel="pop = false"/>
            <van-datetime-picker v-if="step == 'end'" :type="dtype" v-model="ev"
                                 title="截止" v-bind="pickOpt2" @confirm="onConfirmEnd"
                                 @cancel="pop = false"/>
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
            begin: {type: String},
            end: {type: String},
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
                    this.bv = moment(this.begin, this.format).toDate();
                    this.ev = moment(this.end, this.format).toDate();
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
            }
        }
    }
</script>