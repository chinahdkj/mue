<template>
    <div class="mue-tabs" :style="style" :class="{'has-more': !pop || popTabs.length > 0}">
        <van-tabs class="no-flex" v-model="current">
            <slot></slot>
        </van-tabs>
        <a v-if="!pop" class="mue-tabs-more" :class="icon" @click="onMoreClick"></a>
        <mue-popover v-else placement="bottom-end" v-model="popVis" popper-class="mue-tabs-pop">
            <a slot="reference" class="mue-tabs-more" :class="[icon, {'in-more': inMore}]"></a>
            <ul class="mue-tabs-pop-tabs">
                <li v-for="(t, i) in popTabs" :key="i" @click="onPopTabClick(t)"
                    class="mue-tabs-pop-tab" :class="{'is-active': t.isActive}">
                    <i class="mue-tab-icon" v-if="!popNoIcon" :class="t.icon"></i>
                    <span class="mue-tab-title">{{t.title}}</span>
                </li>
            </ul>
        </mue-popover>
    </div>
</template>

<script>
    export default {
        name: "MueTabs",
        componentName: "MueTabs",
        props: {
            value: {type: Number, default: 0},
            icon: {type: String, default: "iconfont icon-gengduo1"},
            height: {type: [String, Number], default: "100%"},
            pop: {type: Boolean, default: true}
        },
        data(){
            return {
                tabs: [],
                current: 0,
                popVis: false
            };
        },
        computed: {
            style(){
                return {
                    height: typeof this.height == "string" ? this.height : `${this.height}px`
                };
            },
            popTabs(){
                return this.tabs;
                // return this.tabs.filter((t) => {
                //     return !!t.isMore;
                // });
            },
            popNoIcon(){
                return this.popTabs.every((t) => {
                    return !t.icon;
                });
            },
            inMore(){
                return false;
                // return this.popTabs.some((t) => {
                //     return t.isActive;
                // });
            }
        },
        watch: {
            value: {
                immediate: true,
                handler(v){
                    this.current = v;
                }
            },
            current(v){
                this.$emit("input", v);
                this.$emit("change", v, this.tabs[v].title);
            },
        },
        methods: {
            indexOfTab(tab){
                let index = -1;
                for(let i = 0; i < this.$slots.default.length; i++){
                    let vn = this.$slots.default[i];
                    if(!vn || !vn.componentOptions || vn.componentOptions.tag !== "mue-tab"){
                        continue
                    }
                    index += 1;
                    if(vn === tab.$vnode){
                        return index;
                    }
                }
            },
            toggleTab(tab){
                return;
                // if(!this.pop){
                //     return;
                // }
                // let x = this.tabs.indexOf(tab);
                // this.$nextTick(() => {
                //     let $tabs = $(this.$el).find(">.van-tabs>.van-tabs__wrap a.mue-tab");
                //     $tabs.eq(x).parents(".van-tab:first").toggle(!tab.isMore);
                //     $tabs.each(function(){
                //         $(this).parents(".van-tab:first").removeClass("is-last");
                //     });
                //     for(let i = this.tabs.length - 1; i >= 0; i--){
                //         let t = this.tabs[i];
                //         if(!t.isMore){
                //             $tabs.eq(i).parents(".van-tab:first").addClass("is-last");
                //             break
                //         }
                //     }
                // });
            },
            addTab(tab){
                let x = this.indexOfTab(tab);
                this.tabs.splice(x === -1 ? this.tabs.length : x, 0, tab);
                this.toggleTab(tab);
            },
            removeTab(tab){
                let x = this.tabs.indexOf(tab);
                this.tabs.splice(x, 1);
            },
            onPopTabClick(tab){
                this.popVis = false;
                let x = this.indexOfTab(tab);
                if(x > -1){
                    this.current = x;
                }
            },
            onMoreClick(){
                this.$emit("more-click");
            }
        },
        components: {}
    }
</script>
