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
                    cells.push(h("cell", {
                        props: {
                            hstyle: this.TABLE.cellHeight, col: cf, row: this.row,
                            value: this.TABLE.getValue(this.row, cf.field), no: this.no
                        }
                    }));
                }
            });

            let evt = {};
            evt[this.$comm.isMobile() ? "touchstart" : "click"] = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.TABLE.onRowClick(this.row, this.no);
            };

            return h("tr", {
                class: ["__row", this.TABLE.rowCls(this.row, this.no)],
                on: evt
            }, cells);

        },
        methods: {}
    };
</script>