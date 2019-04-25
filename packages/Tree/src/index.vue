<template>
    <div class="mue-tree van-picker">
        <div class="van-hairline--top-bottom van-picker__toolbar mue-tree__toolbar"
             v-if="showToolbar">
            <div class="van-picker__cancel" @click="onCancelClick">{{cancelButtonText}}</div>
            <slot name="title">
                <div class="van-ellipsis van-picker__title" v-if="title">{{title}}</div>
            </slot>
            <div class="van-picker__confirm" @click="onConfirmClick">{{confirmButtonText}}</div>
        </div>
        <div class="mue-tree__panels">
            <div class="mue-tree__panels-content">
                <panel v-for="(col, index) in columns" :key="index" :nodes="col"/>
            </div>
        </div>
    </div>
</template>

<script>
    import panel from "./panel";
    import TreeNode from "./treeNode";

    export default {
        name: "MueTree",
        components: {panel},
        provide() {
            return {TREE: this};
        },
        props: {
            title: {type: String, default: ""},
            showToolbar: {type: Boolean, default: true},
            confirmButtonText: {type: String, default: "确认"},
            cancelButtonText: {type: String, default: "取消"},
            multiple: {type: Boolean, default: false},
            data: {
                type: Array, default() {
                    return [];
                }
            }
        },
        data() {
            return {
                columns: [], // 渲染内容
                dict: {}, // 节点属性字典
                leaves: {}, // 叶子节点选中情况
                opens: [], // 展开路径
                current: null // 当前选中
            }
        },
        watch: {
            data: {
                deep: true, immediate: true,
                handler(v) {
                    let dict = {}, checks = {};

                    let initNode = (opts, road) => {
                        let leaves = [];
                        opts.forEach((opt, i) => {

                            let node = new TreeNode(opt, road, i);
                            dict[opt.code] = node;
                            if ((opt.children || []).length === 0) {
                                node.AddLeaves([node.code]);
                                checks[node.code] = false;
                            } else {
                                node.AddLeaves(initNode(opt.children, node.$road));
                            }
                            leaves = leaves.concat(node.$leaves);
                        });
                        return leaves;
                    };

                    initNode(v, []);

                    this.dict = dict;
                    this.leaves = checks;
                    this.initColumns();
                }
            },
            opens: {
                deep: true,
                handler() {
                    this.initColumns();
                }
            }
        },
        methods: {
            onCancelClick() {
                this.$emit("cancel");
            },
            onConfirmClick() {
                this.$emit("confirm");
            },

            selectNode(node) {
                let currents = [...this.opens];
                this.opens.splice(node.$lv, this.opens.length - node.$lv, node.code);
                this.current = node.code;
                if (currents.length !== node.$lv + 1 ||
                    currents[currents.length - 1] !== node.code) {
                    this.$emit("select", node);
                }
            },

            initColumns() {
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

                for (let i = 0; i < this.opens.length; i++) {
                    let cnt = this.opens[i];
                    let opts = getOptions((v) => {
                        return v.$parent === cnt;
                    });
                    opts.length > 0 && columns.push(opts);
                }
                this.columns = columns;
            },
            updateCheck(node, state) {
                let checked = state < 1;
                this.CheckNode(node.code, checked);
                this.$emit("check", node, checked);
            },

            GetNode(code) {
                return this.dict[code];
            },

            CheckAll(state) {
                Object.keys(this.leaves).forEach((k) => {
                    this.leaves[k] = state;
                });
            },

            CheckNode(code, state) {
                let node = this.dict[code];
                if (!node) {
                    return;
                }
                node.$leaves.forEach((k) => {
                    this.leaves[k] = state;
                });
            },

            SetCurrent(c) {
                let node = this.dict[c] || {code: null, $road : []};
                this.current = node.code;
                this.opens = [...node.$road];
            },

            GetCurrent() {
                return (this.dict[this.current] || {}).code;
            },

            GetChecks() {
                let result = [];
                Object.entries(this.dict).forEach(([k, v]) => {
                    v.GetCheckState(this.leaves) > 0 && result.push(k);
                });
                return result;
            }
        }
    };
</script>
