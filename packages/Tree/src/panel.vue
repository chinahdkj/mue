<template>
    <div class="mue-tree__panel mue-tree__item van-hairline--left">
        <div v-for="node in nodes" class="mue-tree__item van-hairline--bottom" :key="node.code"
             :checked="(TREE.opens || []).indexOf(node.code) > -1"
             :class="{current: TREE.current === node.code, opened: TREE.opens.indexOf(node.code) > -1}"
             @click="onSelect(node)" v-show="!search || String(node.name).includes(search)">
            <check-box v-if="TREE.multiple" class="mue-tree__checkbox" :checks="TREE.leaves"
                       :node="node" @check="onCheck"/>
            <span class="mue-tree__label">{{node.name}}</span>
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
        props: ["nodes", "search"],
        data(){
            return {}
        },
        methods: {
            onSelect(node){
                this.TREE.selectNode(node);
            },
            onCheck(node, state){
                this.TREE.updateCheck(node, state);
            }
        }
    };
</script>
