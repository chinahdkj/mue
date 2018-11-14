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
    import {GetType} from './utils';

    export default {
        name: "MueDatePicker",
        components: {},
        props: {
            format: {
                type: String, default: "YYYY-MM-DD"
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
                console.info(this.dtype);
                if(this.dtype === "time"){
                    this.val = this.value;
                }
                else{
                    this.val = moment(this.value, this.format).toDate();
                }
            }
        },
        methods: {
            onConfirm(v){
                debugger
                this.val = v;
                this.pop = false;
                let val;
                if(this.dtype === "time"){
                    val = this.val;
                }
                else{
                    val = moment(this.val).format(this.format);
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
