class TreeNode {
    constructor(data, road, index){
        this.data = {...data};
        // this.data.children = undefined;
        this.code = data.code;
        this.name = data.name;
        this.$lv = road.length;
        this.$road = [...road, data.code];
        this.$index = index;
        this.$parent = this.$lv === 0 ? null : road[road.length - 1];
        this.$leaves = [];
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