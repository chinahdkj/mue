const getChildren = (data) => {
    let childrenCodes = [];
    let childrens = (data.children || []).length ? data.children : []
    let fetch = (nodes) => {
        nodes.forEach(f => {
            if(f.code) childrenCodes.push(f.code);
            if((f.children || []).length) {
                fetch(f.children);
            }
        })
    }
    fetch(childrens);
    return childrenCodes;
}

class TreeNode {
    constructor(data, road, nameRoad, index){
        this.data = {...data};
        // this.data.children = undefined;
        this.code = data.code;
        this.name = data.name;
        this.$lv = road.length;
        this.$road = [...road, data.code];
        this.$nameRoad = [...nameRoad, data.name]
        this.$index = index;
        this.$parent = this.$lv === 0 ? null : road[road.length - 1];
        this.$children = getChildren(data); //当前节点下子节点集合
        this.$leaves = []; //当前节点下叶子节点集合
    }

    AddLeaves(codes){
        this.$leaves = this.$leaves.concat(this.$leaves, codes);
    }

    GetCheckState(checks){
        let ls = this.$leaves.filter((l) => {
            return !!checks[l];
        });
        let state;
        if(ls.length === 0){
            state = 0;
        }
        else if(this.$leaves.length === ls.length){
            state = 1;
        }
        else{
            state = 0.5;
        }
        return state;
    }
}

export default TreeNode;
