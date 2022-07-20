<template>
    <div class="mue-select">
        <div class="mue-form-input has-suffix has-unit" :class="{'mue-form-input__is-disabled': disabled}"
             @click.stop="ShowPop">
            <input type="text" class="input__inner" readonly :value="textShow" :disabled="disabled"
                   :placeholder="placeholder" unselectable="on"/>
            <i class="input__suffix input__suffix_icon iconfont icon-xunjian-xuanzhong "/>
        </div>
        <van-popup ref="pop" class="mue-select-pop" v-model="pop" position="bottom"
                   get-container="body" :close-on-click-overlay="false"
                   @click-overlay="pop = false" @close="onPopupClose">
            <van-area :area-list="areaList" :value="text"
                  :cancel-button-text="cancelButtonText" @cancel="onCancel" @confirm="onConfirm"/>
        </van-popup>
    </div>
</template>

<script>
import { localeMixin, t } from "../../../src/locale";
import { regionData } from 'element-china-area-data'

export default {
    name: "MueRegion",
    mixins: [localeMixin],
    components: {},
    inject: {
        FORM_ITEM: {
            from: "FORM_ITEM",
            default(){
                return {};
            }
        }
    },
    props: {
        value: {default: null},
        clearable: {default: false, type: Boolean},
        disabled: {type: Boolean, default: false},
        array: {type: Boolean, default: false}, //提交结果是否为数组格式
        placeholder: {type: String, default: t('mue.form.region.placeholder')},
    },
    data(){
        return {
            pop: false,
            areaList: {
                province_list: {},
                city_list:{},
                county_list:{},
            },
            data: regionData,
        };
    },
    computed: {
        cancelButtonText(){
            return this.clearable ? t('mue.common.clear') :  t('mue.common.cancel');
        },
        text:{
            get() {
                if (!this.value && this.value !== 0) {
                    return '';
                } else {
                    if (Array.isArray(this.value)) {
                        return [...this.value].join(',');
                    } else {
                        return String(this.value);
                    }
                }
            },
            set(v) {
                if (this.array) {
                    this.$emit("input", v);
                    this.$emit("change", v, this.value);
                } else {
                    let vv = v.length === 0 ? null : v.join(",");
                    this.$emit("input", vv);
                    this.$emit("change", vv, this.value);
                }
            }
        },
        textShow(){
            let text = []
            let indexs = this.text.split(',')
            indexs.forEach((item,index)=>{
                if(index === 0){
                    text.push(this.areaList.province_list[item])
                }else if(index === 1){
                    text.push(this.areaList.city_list[item])
                }else if(index === 2){
                    text.push(this.areaList.county_list[item])
                }
            })
            return text.join(',')
        },
    },
    beforeMount () {
        this.formatAreaList()
    },
    methods: {
        onConfirm(e){
            this.pop = false;
            this.text = e.map(item=>item.code)
        },
        onCancel(){
            this.pop = false;
            if(this.clearable){
                this.$emit("input", null);
                this.$emit("change", null, null);
            }
        },
        onPopupClose(){

        },
        ShowPop(){
            if(this.disabled || this.FORM_ITEM.readonly){
                return;
            }
            this.pop = true;
        },
        formatAreaList(){
            this.data.forEach(parent=>{
                this.areaList.province_list[String(parent.value)] = parent.label;
                (parent.children || []).forEach(child=>{
                    this.areaList.city_list[String(child.value)] = child.label;
                    (child.children || []).forEach(sub=>{
                        this.areaList.county_list[String(sub.value)] = sub.label;
                    })
                })
            })
        }
    }
};
</script>
