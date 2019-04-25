<template>
    <div class="tree-picker-pop">

        <div class="van-picker__toolbar mue-tree-picker-title"><!--v-show="$slots.title || title"-->
            <!--<slot name="title">{{title}}</slot>-->
            <div class="van-picker__cancel" @click="cancelSel">取消</div>
            <div class="van-picker__confirm" @click="confirmSel">确认</div>
        </div>

        <div class="mue-tree-picker-panels">
            <panel v-for="(col, index) in columns" :key="index" :options="col" v-model="currents[index]"
                   :values="values"/>
        </div>

    </div>
</template>

<script type="text/ecmascript-6">
    import panel from "./tree-picker-panel.vue";

    export default {
        name: 'MueTreePop',
        components: {panel},
        provide() {
            return {PICKER: this};
        },
        props: {
            // title: {
            //     type: String,
            //     default: ''
            // },
            value: {default: null},
            data: { //
                type: Array,
                default() {
                    return []
                }
            },
            multiple: {
                type: Boolean,
                default() {
                    return false
                }
            },
            close: {
                type: Function,
                default: null
            }
        },
        data() {
            return {
                values: [],
                columns: [],
                dict: {},
                currents: []
            }
        },
        computed: {
            checkeds() {
                return Object.values(this.dict).filter((c) => {
                    return c.$count === c.$checked;
                });
            }
        },
        watch: {
            data: {
                deep: true, immediate: true,
                handler(v) {
                    let dict = {};

                    let feach = (opts, road, disabled) => {
                        let lv = road.length;

                        let count = 0;
                        opts.forEach((opt, i) => {
                            let clone = {
                                ...opt, $lv: lv, $index: i, $road: [...road, opt.code],
                                $parent: lv === 0 ? null : road[road.length - 1],
                                disabled: disabled || opt.disabled, $count: 0, $checked: 0
                            };
                            delete clone.children;
                            dict[opt.code] = clone;

                            if ((opt.children || []).length === 0) {
                                clone.$count = 1;
                            } else {
                                clone.$count = feach(opt.children, clone.$road, clone.disabled);
                            }

                            // if (clone.disabled) {
                            //     clone.$count = 0;
                            // }

                            count += clone.$count;
                        });
                        return count;
                    };

                    feach(v, [], false);

                    this.dict = dict;
                }
            },
            currents: {
                deep: true,
                handler() {
                    this.initColumns();
                }
            }
        },
        methods: {
            updateCurrents(opt) {
                let currents = [...this.currents];
                this.currents.splice(opt.$lv, this.currents.length - opt.$lv, opt.code);
                if (!(currents.length === opt.$lv + 1 && currents[currents.length - 1] === opt.code) && !this.multiple) {
                    this.$emit("select", opt);
                }
            },
            initColumns() {
                let getOptions = (flter) => {
                    let options = Object.values(this.dict).filter(flter);
                    options.sort((c, n) => {
                        return c.$index - n.$index;
                    });
                    return options;
                };

                let columns = [
                    getOptions((v) => {
                        return v.$lv === 0;
                    })
                ];

                for (let i = 0; i < this.currents.length; i++) {
                    let cnt = this.currents[i];
                    let opts = getOptions((v) => {
                        return v.$parent === cnt;
                    });
                    opts.length > 0 && columns.push(opts);
                }
                this.columns = columns;
            },
            confirmSel() {
                let result = [] || '';
                if (!this.multiple) {
                    result = this.dict[this.currents[this.currents.length - 1]];
                } else {
                    result = Object.values(this.dict).filter((c) => {
                        return c.$count === c.$checked;
                    });
                }
                this.$emit('confirm', result);
                this.close();
            },
            cancelSel() {
                this.$emit('cancel');
                this.close();
            },
            updateChecks(opt) {
                let checked = opt.$checked !== opt.$count;
                // 更新子节点选中状态
                let updateSon = ($p) => {
                    Object.values(this.dict).filter((c) => {
                        return c.$parent === $p;
                    }).forEach((c) => {
                        c.$checked = checked ? c.$count : 0;
                        updateSon(c.code);
                    });
                };
                updateSon(opt.code);

                // 更新当前
                opt.$checked = checked ? opt.$count : 0;

                // 更新父节点选中状态
                let updateParent = ($p) => {
                    let parent = this.dict[$p];
                    if (!parent) {
                        return;
                    }
                    let checks = 0;

                    Object.values(this.dict).filter((c) => {
                        return c.$parent === $p;
                    }).forEach((c) => {
                        checks += c.$checked;
                    });
                    parent.$checked = checks;
                    if (parent.$lv > 0) {
                        updateParent(parent.$parent);
                    }
                };

                updateParent(opt.$parent);
                this.$emit('select',this.checkeds)
            }
        },
        mounted() {
            this.initColumns();
            if (this.value) {
                if (!this.multiple) {
                    this.currents = this.dict[this.value].$road;
                } else {
                    this.value.forEach((v)=>{
                        let opt = this.dict[v];
                        if(opt.$count === 1){
                            this.updateChecks(opt);
                        }
                    });
                }
            }
        }
    };
</script>
