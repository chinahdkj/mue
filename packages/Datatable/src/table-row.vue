<script>
    import cell from "./cell";

    export default {
        components: {cell},
        inject: ["TABLE"],
        props: ["row", "no", "isFixed"],
        data(){
            return {};
        },
        render(h){
            if(this.TABLE.$scopedSlots.row){
                return this.TABLE.$scopedSlots.row({
                    row: this.row, cols: this.TABLE.colFields, no: this.no
                });
            }

            let cells = [];
            this.TABLE.colFields.forEach((cf) => {
                if(!!cf.fixed === !!this.isFixed){
                    if(cf.type === 'selection'){
                        cells.push(h("td", {
                            props: {
                                hstyle: this.TABLE.cellHeight, col: cf, row: this.row,
                                no: this.no
                            },
                        },[
                            h('van-checkbox',{
                                props: {
                                    value:this.row._mue_checked
                                },
                                on: {
                                    input: event =>{
                                        this.row._mue_checked = event
                                        this.$forceUpdate()
                                        this.TABLE.onSelectionChange()
                                    },
                                    click:(e)=>{
                                        e.stopPropagation()
                                    }
                                }
                            })
                        ]));
                    }else{
                        cells.push(h("cell", {
                            props: {
                                hstyle: this.TABLE.cellHeight, col: cf, row: this.row,
                                value: this.TABLE.getValue(this.row, cf.field), no: this.no
                            }
                        }));
                    }
                }
            });

            return h("tr", {
                class: ["__row", this.TABLE.rowCls(this.row, this.no)],
                on: {
                    click: () => {
                        this.TABLE.onRowClick(this.row, this.no);
                    },
                    touchstart: (e)=>{
                        e.preventDefault();
                    }
                }
            }, cells);

        },
        methods: {}
    };
</script>