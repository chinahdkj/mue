<template>
    <form class="mue-form" :class="{'required-at-end': requiredPos === 'end' }">
        <slot></slot>

        <div class="mue-form-buttons" v-if="!readonly">
            <van-button size="large" plain @click.prevent="cancel">取消</van-button>
            <van-button size="large" type="primary" @click.prevent="confirm">提交</van-button>
        </div>
    </form>
</template>

<script>
    import Validator from '../../../src/utils/validator';
    import {objectGet} from '../../../src/utils/object';

    export default {
        name: "MueForm",
        components: {},
        props: {
            readonly: {type: Boolean, default: false},
            labelWidth: {type: Number, default: 110},
            requiredPos: {type: String, default: "start"},
            inline: {type: Boolean, default: false},
            value: {
                default(){
                    return {};
                }
            }
        },
        provide(){
            return {
                FORM: this
            };
        },
        data(){
            return {
                items: []
            };
        },
        methods: {
            addItem(item){
                this.items.push(item);
            },
            removeItem(item){
                let i = this.items.indexOf(item);
                this.items.splice(i, 1);
            },
            cancel(){
                this.ClearValid();
                this.$emit('cancel');
            },
            confirm(){
                let promise = new Promise((resolve, reject) => {
                    this.Validate().then(() => {
                        resolve(this.value);
                    }).catch(({messages, inputs}) => {
                        inputs.forEach((ipt) => {
                            ipt.isError = true;
                        });
                        this.$dialog.alert({
                            className: "mue-form-valid-dialog",
                            message: `<div class="valid-errors">${messages.join("<br/>")}</div>`
                        });
                        reject({messages, inputs});
                    });
                });
                this.$emit("confirm", promise);
            },

            ClearValid(){
                this.items.forEach((item) => {
                    item.isError = false;
                });
            },
            Validate(callback){
                let model = {}, rules = {}, vinputs = {};
                for(let i = 0; i < this.items.length; i++){
                    let item = this.items[i];
                    item.isError = false;
                    if(!item.field){
                        continue;
                    }

                    // 验证规则提取
                    let vrules = item.rules.map((r) => {
                        return {...r};
                    });
                    if(item.required){
                        vrules.splice(0, 0, {required: true});
                    }
                    if(vrules.length === 0){
                        continue
                    }

                    let field = item.field.replace(/\./g, "::");
                    rules[field] = vrules;
                    vinputs[field] = item;
                    model[field] = objectGet(this.value, item.field);

                }
                let promise;
                // if no callback, return promise
                if(typeof callback !== 'function' && Promise){
                    promise = new Promise((resolve, reject) => {
                        callback = (valid) => {
                            valid.result ? resolve(valid) : reject(valid);
                        };
                    });
                }

                // 没验证规则
                if(Object.keys(rules).length === 0 && typeof callback === "function"){
                    callback({result: true, messages: [], inputs: []});
                }
                else{
                    let handler = Validator.init(rules);
                    handler.validate(model, (errors) => {
                        errors = errors || [];
                        let msgs = [], inputs = [];
                        errors.forEach(({field, message}) => {
                            let input = vinputs[field];

                            let msg = message.indexOf(`*#{${field}}#*`) > -1 ?
                                      message.replace(`*#{${field}}#*`,
                                          `<b class="valid-error">${input.label}</b> `) :
                                      `<b class="valid-error">${input.label}</b> ${message}`;
                            msgs.push(msg);
                            inputs.push(input);
                        });

                        callback({result: msgs.length === 0, messages: msgs, inputs});
                    });
                }
                if(promise){
                    return promise;
                }

            }
        },
        mounted(){
        }
    }
</script>