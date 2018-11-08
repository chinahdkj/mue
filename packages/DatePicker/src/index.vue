<template>
    <div class="mue-date-picker">

        <div class="pick-bar" @click="pop = true">
            <span class="pick-bar-content">
                <a>{{value}}</a>
                <van-icon name="arrow-left" @click.stop="onClickArrow('previous')"/>
                <van-icon name="arrow" @click.stop="onClickArrow('next')"/>
            </span>
        </div>

        <van-popup class="mue-date-picker-pop" v-model="pop" position="bottom"
                   :lazy-render="false">
            <van-datetime-picker :type="dtype" v-model="val" @confirm="onConfirm"
                                 @cancel="pop = false"/>
        </van-popup>
    </div>
</template>

<script>
    import {Date2String, GetType, String2Date} from './utils';

    export default {
        name: "MueDatePicker",
        components: {},
        props: {
            format: {
                type: String, default: "yyyy-MM-dd"
            },
            bar: {
                type: Boolean, default: false
            },
            value: {type: String}
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
            }
        },
        watch: {
            pop(v){
                if(!v){
                    return;
                }
                if(this.dtype === "time"){
                    this.val = this.value;
                }
                else{
                    this.val = String2Date(this.value, this.format);
                }
            }
        },
        methods: {
            onConfirm(v){
                this.val = v;
                this.pop = false;
                let val;
                if(this.dtype === "time"){
                    val = this.val;
                }
                else{
                    val = Date2String(this.val, this.format);
                }
                this.$emit("input", val);
                this.$emit("confirm", val);
            },
            onClickArrow(act){
                this.$emit("arrow", act);
            }
        }
    }
</script>
