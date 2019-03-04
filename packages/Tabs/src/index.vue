<template>
    <div class="mue-tabs" :style="style" v-resize="resize"
         :class="{'active-at-more': !pop && activeAtMore}">
        <van-tabs :class="{'no-flex': !flex}" v-model="current" @click="onTabClick"
                  :swipe-threshold="swipeThreshold">
            <slot></slot>
        </van-tabs>

        <div class="mue-tabs-btns" v-resize="resize">
            <a v-if="!pop" class="mue-tabs-more" :class="[icon, {'in-more': activeAtMore}]"
               @click="onMoreClick"></a>
            <mue-popover v-else placement="bottom-end" v-model="popVis" popper-class="mue-tabs-pop"
                         :append-to-body="false">
                <a slot="reference" class="mue-tabs-more" :class="[icon, {'in-more': inMore}]"></a>
                <ul class="mue-tabs-pop-tabs">
                    <pop-tab v-for="(t, i) in popTabs" :key="i" @click.native="onPopTabClick(t)"
                             :tab="t" :no-icon="popNoIcon" class="mue-tabs-pop-tab"
                             :class="{'is-active': t.isActive, 'is-disabled':t.disabled}">
                        <!--<i class="mue-tab-icon" v-if="!popNoIcon" :class="t.icon"></i>-->
                        <!--<span class="mue-tab-title">{{t.title}}</span>-->
                    </pop-tab>
                </ul>
            </mue-popover>

            <div v-if="$slots.suffix" class="mue-tabs-suffix">
                <slot name="suffix"></slot>
            </div>
        </div>

    </div>
</template>

<script>
    import popTab from "./poptab";

    export default {
        name: "MueTabs",
        provide(){
            return {
                TABS: this
            };
        },
        props: {
            flex: {type: Boolean, default: false},
            swipeThreshold: {type: Number, default: 4},
            value: {type: Number, default: 0},
            icon: {type: String, default: "iconfont icon-gengduo1"},
            height: {type: [String, Number], default: "100%"},
            pop: {type: Boolean, default: true},
            activeAtMore: {type: Boolean, default: false}
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
            resize(){
                let btns = this.$el.getElementsByClassName("mue-tabs-btns");
                let btnsWidth = btns.length > 0 ? btns[0].offsetWidth : 0;
                let tabsWrap = this.$el.getElementsByClassName("van-tabs__wrap");
                if(tabsWrap.length > 0){
                    tabsWrap[0].style.paddingRight = btnsWidth + "px";
                }
            },
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
            onTabClick(index, title){
                this.$emit("click", index, title);
            },
            onPopTabClick(tab){
                if(tab.disabled){
                    return;
                }
                this.popVis = false;
                let x = this.tabs.indexOf(tab);
                if(x > -1){
                    this.current = x;
                }
                this.$emit("click", x, this.tabs[x].title);
            },
            onMoreClick(){
                this.$emit("more-click");
            }
        },
        components: {popTab}
    }
</script>
