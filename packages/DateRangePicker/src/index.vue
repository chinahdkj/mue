<template>
    <div class="mue-date-range-picker">

        <div class="pick-bar" @click="pop = true">
            <span class="pick-bar-content">
                {{begin}} ~ {{end}}
                <van-icon name="arrow-left" />
                <van-icon name="arrow" />
            </span>
        </div>

        <!--<van-nav-bar v-if="bar">-->
            <!--<div slot="title" @click="pop = true">-->
                <!--<van-icon name="arrow-left" />-->
                <!--<span>{{begin}} ~ {{end}}</span>-->
                <!--<van-icon name="arrow" />-->
            <!--</div>-->
        <!--</van-nav-bar>-->
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
    import {Date2String, GetType, String2Date} from '../../DatePicker/src/utils';

    export default {
        name: "MueDateRangePicker",
        components: {},
        props: {
            format: {
                type: String, default: "yyyy-MM-dd"
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
                    this.bv = String2Date(this.begin, this.format);
                    this.ev = String2Date(this.end, this.format);
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
                    bv = Date2String(this.bv, this.format);
                    ev = Date2String(this.ev, this.format);
                }
                this.$emit("update:begin", bv);
                this.$emit("update:end", ev);
                this.$emit("confirm", bv, ev);
            }
        }
    }
</script>

<style scoped>

</style>
