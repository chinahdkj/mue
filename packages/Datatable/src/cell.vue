<script>
import Vue from "vue";
export default {
    components: {},
    props: {
        hstyle: {type: Object},
        no: {type: Number},
        col: {type: Object},
        row: {type: Object},
        value: null
    },
    data(){
        return {};
    },
    inject: ["TABLE"],
    render(h){
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
        let scopedSlots = {...(this.TABLE.colSlots || {}), ...this.TABLE.$scopedSlots}
        let $scoped = this.col.tmpl && scopedSlots[this.col.tmpl]
            ? scopedSlots[this.col.tmpl] : null;
        if($scoped){
            inner = [$scoped({row: this.row, col: this.col, value: this.value, no: this.no})];
        }
        else{
            let v = this.value == null ? "" : this.value;
            let dtype = this.col.options.dtype;
            let format = this.col.options.format;
            if (dtype === 'number' && format) {
                v = Vue.filter("NUMBER")(v, format);
            } else if (dtype === 'date' && format) {
                v = Vue.filter("DATE")(v, format);
            } else if(dtype === "code" && format){
                let r = null;
                if((this.TABLE.bindings || {})[format]){
                    r = this.TABLE.bindings[format].find((c) => {
                        return c.Value === v;
                    });
                }
                v = r ? r.Name : "";
            }

            td.domProps = {innerHTML: v};
        }
        return h("td", td, inner);
    },

    methods: {}
};
</script>