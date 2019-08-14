<script>
    export default {
        components: {},
        props:["total", "current"],
        data(){
            return {};
        },
        render(h){

            let pager = h("a", {"class": "__pager"}, []);
            let list = h("ul", {}, []);
            pager.children.push(list);
            pager.children.push(h("span", {domProps: {innerHTML: this.total}}));

            let nos = [];

            for(let i = 0; i < 5; i++){
                let n = this.current - 2 + i;
                if(n > 0 && n <= this.total){
                    nos.push(n);
                }
            }

            if(nos.length === 0){
                return pager;
            }

            let top = (nos[0] - 1) * 22;
            let pos = -(this.current - 1) * 22;

            nos.forEach((n, i) => {
                list.children.push(h("li", {
                    style: {transform: `translateY(${pos}px)`, marginTop: `${i === 0 ? top : 0}px`},
                    domProps: {innerHTML: n}
                }));
            });

            return pager;

        },
        methods: {}
    };
</script>