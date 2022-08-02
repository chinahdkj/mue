<template>
    <div class="mue-tree van-picker">
        <div class="van-hairline--top-bottom van-picker__toolbar mue-tree__toolbar"
             v-if="showToolbar">
            <div class="van-picker__cancel" @click="onCancelClick">{{cancelButtonText}}</div>
            <input v-if="searchable" class="input__search" type="text" v-model="searchValue"
                   :placeholder="t('mue.common.placeholder')">
            <slot v-else name="title">
                <div class="van-ellipsis van-picker__title" v-if="title">{{title}}</div>
            </slot>
            <div class="van-picker__confirm" @click="onConfirmClick">{{confirmButtonText}}</div>
        </div>
        <div class="mue-tree__panels">
            <div class="mue-tree__panels-content">
                <panel v-for="(col, index) in columns" :key="index" :nodes="col"
                       :search="searchable ? searchValue : null" :panel-unhide="panelUnhide">
                    <template #node="{node}">
                        <slot name="node" :node="node">{{node.name}}</slot>
                    </template>
                </panel>
            </div>
        </div>
    </div>
</template>

<script>
    import panel from "./panel";
    import TreeNode from "./treeNode";
    import {localeMixin, t} from "../../../src/locale";

    export default {
        name: "MueTree",
        components: {panel},
        mixins: [localeMixin],
        provide(){
            return {TREE: this};
        },
        props: {
            title: {type: String, default: ""},
            showToolbar: {type: Boolean, default: true},
            confirmButtonText: {type: String, default: () => {
                return t('mue.common.confirm');
            }},
            cancelButtonText: {type: String, default: () => {
                return t('mue.common.cancel');
            }},
            multiple: {type: Boolean, default: false},
            data: {
                type: Array, default(){
                    return [];
                }
            },
            panelUnhide: {type: Boolean, default: false}, // 是否显示全名称，不隐藏
            selectable: {type: Function, default: null},
            searchable: {type: Boolean, default: false}
        },
        data(){
            return {
                columns: [], // 渲染内容
                dict: {}, // 节点属性字典
                leaves: {}, // 叶子节点选中情况
                opens: [], // 展开路径
                current: null, // 当前选中
                searchValue: ""
            };
        },
        watch: {
            data: {
                deep: true, immediate: true,
                handler(v){
                    let dict = {}, checks = {};

                    let initNode = (opts, road, nameRoad) => {
                        let leaves = [];
                        opts.forEach((opt, i) => {

                            let node = new TreeNode(opt, road, nameRoad, i);
                            dict[opt.code] = node;
                            if((opt.children || []).length === 0){
                                node.AddLeaves([node.code]);
                                checks[node.code] = false;
                            }
                            else{
                                node.AddLeaves(initNode(opt.children, node.$road, node.$nameRoad));
                            }
                            leaves = leaves.concat(node.$leaves);
                        });
                        return leaves;
                    };

                    initNode(v, [], []);

                    this.dict = dict;
                    this.leaves = checks;
                    this.initColumns();
                }
            },
            opens: {
                deep: true,
                handler(){
                    this.initColumns();
                }
            },
            searchValue(){
                this.opens = [];
            }
        },
        methods: {
            onCancelClick(){
                this.searchValue = "";
                this.$emit("cancel");
            },
            onConfirmClick(){
                this.searchValue = "";
                this.$emit("confirm");
            },

            selectNode(node){
                let currents = [...this.opens];
                this.opens.splice(node.$lv, this.opens.length - node.$lv, node.code);

                if(typeof this.selectable === "function" && !this.selectable(node.data, node)){
                    return;
                }

                this.current = node.code;
                if((currents.length !== node.$lv + 1 ||
                    currents[currents.length - 1] !== node.code)){
                    this.$emit("select", node);
                }
            },

            initColumns(){
                let getOptions = (f) => {
                    let options = Object.values(this.dict).filter(f);
                    options.sort((c, n) => {
                        return c.$index > n.$index;
                    });
                    return options;
                };

                let columns = [
                    getOptions((v) => {
                        return v.$lv === 0;
                    })
                ];

                for(let i = 0; i < this.opens.length; i++){
                    let cnt = this.opens[i];
                    let opts = getOptions((v) => {
                        return v.$parent === cnt;
                    });
                    opts.length > 0 && columns.push(opts);
                }
                this.columns = columns;
            },
            updateCheck(node, state){
                let checked = state < 1;
                this.CheckNode(node.code, checked);
                this.$emit("check", node, checked);
            },

            GetNode(code){
                return this.dict[code];
            },

            CheckAll(state){
                Object.keys(this.leaves).forEach((k) => {
                    this.leaves[k] = state;
                });
            },

            CheckNode(code, state){
                let node = this.dict[code];
                if(!node){
                    return;
                }
                node.$leaves.forEach((k) => {
                    this.leaves[k] = state;
                });
            },

            SetCurrent(c){
                let node = this.dict[c];
                if(!node){
                    this.current = null;
                    this.opens = [];
                    return;
                }
                if(typeof this.selectable === "function" && !this.selectable(node.data, node)){
                    this.current = null;
                    this.opens = [];
                    return;
                }
                this.current = node.code;
                this.opens = node.$road;
            },

            GetCurrent(){
                let node = this.dict[this.current];
                if(!node){
                    return null;
                }
                if(typeof this.selectable === "function" && !this.selectable(node.data, node)){
                    return null;
                }
                return node.code;
            },

            GetNodeCheckState(node){
                return node.GetCheckState(this.leaves);
            },
            GetChecks(){
                let result = [];
                Object.entries(this.dict).forEach(([k, v]) => {
                    v.GetCheckState(this.leaves) > 0 &&
                    (typeof this.selectable !== "function" || this.selectable(v.data, v)) &&
                    result.push(k);
                });
                return result;
            }
        }
    };
</script>
