<template>
    <form class="mue-form" :class="{'required-at-end': requiredPos === 'end' }">
        <slot></slot>

        <div class="mue-form-buttons" v-if="!readonly">
            <van-button native-type="button" size="large" plain @click="cancel">
                {{cancelText}}
            </van-button>
            <van-button native-type="button" size="large" type="primary" @click="confirm">
                {{confirmText}}
            </van-button>
        </div>
    </form>
</template>

<script>
    import Validator from '../../../src/utils/validator';
    import {objectGet} from '../../../src/utils/object';
    import {localeMixin, t, getValidLang} from "../../../src/locale";
    export default {
        name: "MueForm",
        mixins: [localeMixin],
        components: {},
        props: {
            crud: {type: Object, default: null},
            readonly: {type: Boolean, default: false},
            labelWidth: {type: Number, default: 110},
            requiredPos: {type: String, default: "start"},
            inline: {type: Boolean, default: true},
            value: {
                default(){
                    return {};
                }
            },
            cancelText: {type: String, default: () => {
                return t("mue.common.cancel");
            }},
            confirmText: {type: String, default: () => {
                return t("mue.common.submit");
            }}
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
            // 唯一性验证
            uniqueValid({fields = [], message = "", method = undefined}, item){
                message = message || t("mue.form.beUnique");
                if(!this.crud && typeof method !== "function"){
                    return (rule, value, callback) => {
                        callback();
                    };
                }

                return (rule, value, callback) => {
                    let index = fields.indexOf(item.field);
                    if(index > -1){
                        fields.splice(index, 1);
                    }
                    let labels = [], conditions = [], dic = {};
                    conditions.push({
                        Field: item.field, Value: objectGet(this.value, item.field),
                        Operate: "=", Relation: "and"
                    });
                    for(let i = 0; i < this.items.length; i++){
                        let tm = this.items[i];
                        dic[tm.field] = tm;
                    }

                    fields.forEach((f) => {
                        conditions.push({
                            Field: f, Value: objectGet(this.value, f),
                            Operate: "=", Relation: "and"
                        });
                        dic[f] && labels.push(dic[f].label);
                    });

                    let key = null;
                    if(this.crud){
                        key = objectGet(this.value, this.crud.key);
                        labels = labels.length > 0 ? `<b>、${labels.join("、")}</b> ` : "";

                        if(key != null){
                            conditions.push({
                                Field: this.crud.key, Value: key, Operate: "!=", Relation: "and"
                            });
                        }
                        else{
                            conditions.push({
                                Field: this.crud.key, Value: "nil", Operate: "!=", Relation: "and"
                            });
                        }
                    }

                    if(typeof method === "function"){
                        // 专用非重验证
                        let promise = method(this.value, conditions, key == null);

                        if(promise instanceof Promise){
                            promise.then(() => {
                                callback();
                            }).catch(() => {
                                callback(new Error(`${labels}${message}`));
                            });
                        }
                        else{
                            promise.done(() => {
                                callback();
                            }).fail(() => {
                                callback(new Error(`${labels}${message}`));
                            });
                        }
                    }
                    else{
                        let prms = this.crud.query({conditions, size: 1, index: 1});
                        if(prms instanceof Promise){
                            prms.then(({total}) => {
                                if(total === 0){
                                    callback();
                                }
                                else{
                                    callback(new Error(`${labels}${message}`));
                                }
                            }).catch(() => {
                                new Error(`${labels}${t("mue.form.uniqueFail")}`)
                            });
                        }
                        else{
                            prms.done(({total}) => {
                                if(total === 0){
                                    callback();
                                }
                                else{
                                    callback(new Error(`${labels}${message}`));
                                }
                            }).fail(() => {
                                new Error(`${labels}${t("mue.form.uniqueFail")}`)
                            });
                        }
                    }

                };

            },

            addItem(item){
                this.items.push(item);
            },
            removeItem(item){
                let i = this.items.indexOf(item);
                this.items.splice(i, 1);
            },
            cancel(){
                if(this.$listeners["super-cancel"]){
                    this.$emit("super-cancel");
                    return;
                }
                this.ClearValid();
                this.$emit("cancel");
            },
            confirm(){
                if(this.$listeners["super-confirm"]){
                    this.$emit("super-confirm");
                    return;
                }

                let promise = new Promise((resolve, reject) => {
                    this.Validate().then(() => {
                        resolve(this.value);
                    }).catch((e) => {
                        this.ShowError(e);
                        reject(e);
                    });
                });
                this.$emit("confirm", promise);
            },

            ClearValid(){
                this.items.forEach((item) => {
                    item.isError = false;
                });
            },
            ShowError({messages, inputs}){
                inputs.forEach((ipt) => {
                    ipt.isError = true;
                });
                this.$dialog.alert({
                    className: "mue-form-valid-dialog",
                    message: `<div class="valid-errors">${messages.join("<br/>")}</div>`
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
                        if(r.type === "unique"){
                            return {validator: this.uniqueValid(r, item)};
                        }
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
                    let handler = Validator.init(rules, getValidLang());
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