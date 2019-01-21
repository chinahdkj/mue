<script>
    import {deepClone} from "../../../src/utils/vnode";

    export default {
        props: ["tab", "noIcon"],
        data(){
            return {};
        },
        render(h){
            let chs = [];
            if(!this.tab.$slots.title){
                !this.noIcon && chs.push(h("i", {
                    "class": ["mue-tab-icon", this.tab.icon]
                }));
                chs.push(h("span", {
                    "class": "mue-tab-title"
                }, this.tab.title))
            }
            else{
                chs = deepClone(this.tab.$slots.title, h);
            }
            return h("li", {}, chs);
        },
        methods: {}
    }
</script>