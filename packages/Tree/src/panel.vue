<template>
    <div class="mue-tree__panel mue-tree__item" :class="{'mue-tree__panel__unhide': !!panelUnhide}">
        <div v-for="node in nodes" class="mue-tree__item van-hairline--bottom" :key="node.code"
             :checked="(TREE.opens || []).indexOf(node.code) > -1"
             :class="{current: TREE.current === node.code, opened: TREE.opens.indexOf(node.code) > -1}"
             @click="onSelect(node)" v-show="!search || showNode(node)">
            <check-box v-if="TREE.multiple" class="mue-tree__checkbox" :checks="TREE.leaves"
                       :node="node" @check="onCheck"/>
            <span class="mue-tree__label">
                <slot name="node" :node="node">{{node.name}}</slot>
            </span>
        </div>
    </div>
</template>

<script>
    import checkBox from "./checkbox";

    export default {
        inject: {
            TREE: "TREE"
        },
        components: {checkBox},
        props: ["nodes", "search", "panelUnhide"],
        data(){
            return {}
        },
        methods: {
            onSelect(node){
                this.TREE.selectNode(node);
            },
            onCheck(node, state){
                this.TREE.updateCheck(node, state);
            },
            showNode(node) {
                let n = node.$children.some((s) => {
                    return String(this.TREE.dict[s].name).includes(this.search);
                })

                let p = node.$nameRoad.some((name) => { //路径中包含搜索内容
                    return String(name).includes(this.search);
                })

                return String(node.name).includes(this.search) || n || p
            }
        }
    };
</script>
