<script>
    export default {
        components: {},
        props: {
            hstyle: {type: Object},
            fixed: {type: Boolean, default: false},
            no: {type: Number},
            col: {type: Object},
            row: {type: Object},
            value: null
        },
        data(){
            return {};
        },
        inject:["TABLE"],
        render(h){
            if(!!this.col.fixed !== this.fixed){
                return h("td", {style: this.hstyle, domProps: {innerHTML: "&nbsp;"}});
            }
            let td = {
                style: [this.hstyle, {"text-align": this.col.align || "center"}]
            };
            let inner = [];
            if(this.TABLE.$listeners["cell-click"]){
                td.on = {
                    click: (e) => {
                        this.TABLE.$emit("cell-click",
                            this.value, this.row, this.col, this.no, e);
                    }
                }
            }
            let $scoped = this.col.tmpl && this.TABLE.$scopedSlots[this.col.tmpl]
                          ? this.TABLE.$scopedSlots[this.col.tmpl] : null;
            if($scoped){
                inner = [$scoped({row: this.row, col: this.col, value: this.value, no: this.no})];
            }
            else{
                td.domProps = {innerHTML: this.value};
            }
            return h("td", td, inner);
        },

        methods: {}
    }
</script>