<template>
    <form class="mue-form">
        <slot></slot>

        <div class="mue-form-buttons">
            <van-button size="large" plain @click="cancel">取消</van-button>
            <van-button size="large" type="primary" @click="submit">提交</van-button>
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
            labelWidth: {type: Number, default: 90},
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
            submit(){
                this.Validate(({result, messages, inputs}) => {
                    if(result){
                        this.$emit("confirm", this.value);
                        return;
                    }
                    inputs.forEach((ipt) => {
                        ipt.isError = true;
                    });
                    this.$dialog.alert({
                        className: "mue-form-valid-dialog",
                        message: `<div class="valid-errors">${messages.join("<br/>")}</div>`
                    });
                });
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
                if(typeof callback !== 'function' && window.Promise){
                    promise = new window.Promise((resolve, reject) => {
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
                            msgs.push(message.replace(`*#{${field}}#*`,
                                `<b class="valid-error">${input.label}</b>`));
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