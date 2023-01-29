<template>
    <div class="mue-panel"
         :class="[hairline == 'none' ? '' : ('mue-panel--hairline-' + hairline),
         $slots.tools || title ? '' : 'mue-panel--no-header']">
        <div v-if="hairline != 'none'" class="mue-hairline"
             :class="'mue-hairline--' + hairline"></div>
        <div class="mue-panel-header" v-if="$slots.tools || title ">
            <panel-title :title="title"/>
            <div class="mue-panel-tools">
                <slot name="tools"></slot>
            </div>
        </div>
        <div class="mue-panel-body" ref="panelBody">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    import PanelTitle from "./panel-title";

    export default {
        name: "MuePanel",
        props: {
            hairline: {
                type: String,
                default: "none",
                validator: function(v){
                    return ["none", "thin", "normal", "wide"].findIndex(p => p === v) > -1;
                }
            },
            title: String
        },
        data(){
            return {};
        },
        methods: {
            setPanelBodyScrollTop(top){
                this.$refs.panelBody.scrollTop = top || 0
            },
            handleScroll(){
                //获取dom滚动距离
                const scrollTop = this.panelBody.scrollTop;
                //获取可视区高度
                const offsetHeight = this.panelBody.offsetHeight;
                //获取滚动条总高度
                const scrollHeight = this.panelBody.scrollHeight;

                this.$emit('scroll', {scrollTop, offsetHeight, scrollHeight})
            },
        },
        components: {PanelTitle},
        computed: {
            panelBody() {
                return this.$refs.panelBody;
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.panelBody.addEventListener("scroll", this.handleScroll);
            });
        },
        destroyed() {
            this.panelBody.removeEventListener("scroll", this.handleScroll);
        }
    }
</script>
