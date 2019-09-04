<script>
    import tableRow from "./table-row";

    export default {
        props: ["rows", "isFixed", "start"],
        components: {tableRow},
        data(){
            return {};
        },
        render(h){

            let trs = this.rows.map((r, i) => {
                return h("table-row", {
                    props: {
                        no: i + this.start, row: r, isFixed: this.isFixed
                    }
                });
            });


            return h("tbody", {}, trs);
        },
        methods: {}
    };
</script>