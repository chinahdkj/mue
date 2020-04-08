<template>
    <div class="mue-load-more">
        <div class="mue-load-more__box" ref="box" :style="boxStyle">
            <div class="mue-load-more__wrap">
                <div class="mue-load-more__content" ref="content">
                    <slot></slot>
                </div>
            </div>

            <div v-show="scrolling && $listeners['refresh'] && !disRefresh && top.state"
                 class="mue-load-more__top" :style="top.style">
                <span class="mue-load-more__text">
                    <i v-show="top.state != 'loading'" class="iconfont icon-xiangxiajiantou"
                       :class="{'is-drop': top.state === 'drop'}" aria-hidden="true"/>
                    <template v-if="top.state === 'loading' || loading">
                        {{topLoadingText}}
                    </template>
                    <template v-else-if="top.state === 'pull'">
                        {{topPullText}}
                    </template>
                    <template v-else-if="top.state === 'drop'">
                        {{topDropText}}
                    </template>
                </span>
            </div>

            <div v-show="scrolling > 0 && $listeners['load-more'] && !disLoadMore && bottom.state"
                 class="mue-load-more__bottom"
                 :style="bottom.state != 'loading' ? bottom.style : {bottom: -distance + 'px'}">
                <span v-if="allLoaded" class="mue-load-more__text">
                    {{moreThenView ? allLoadedText : ""}}
                </span>

                <span v-else class="mue-load-more__text">
                    <i v-if="bottom.state != 'loading'" aria-hidden="true"
                       class="iconfont icon-xiangxiajiantou-copy"
                       :class="{'is-drop': bottom.state === 'drop'}"/>
                    <template v-if="bottom.state === 'loading' || loading">
                        {{bottomLoadingText}}
                    </template>
                    <template v-else-if="bottom.state === 'pull'">
                        {{bottomPullText}}
                    </template>
                    <template v-else-if="bottom.state === 'drop'">
                        {{bottomDropText}}
                    </template>
                </span>
            </div>

        </div>


        <transition name="van-slide-up">
            <div class="mue-load-more__pagination" v-show="pageNo > 1" @click="backTop">
                <div class="__button" :class="{'is-pager': scrolling}">
                    <a class="__backtop">
                        <i class="iconfont icon-zhiding"></i>
                    </a>
                    <pager :total="pageTotal" :current="pageNo"></pager>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>

    import BETTER_SCROLL from "better-scroll";
    import Pager from "./pager";

    import {localeMixin, t} from "../../../src/locale";

    export default {
        mixins: [localeMixin],
        name: "MueLoadMore",
        components: {Pager},
        props: {
            autoFill: {type: Boolean, default: true},

            topPullText: {type: String, default: () => {
                return t("mue.loadMore.topPullText");
            }},
            topDropText: {type: String, default:  () => {
                return t("mue.loadMore.topDropText");
            }},
            topLoadingText: {type: String, default: () => {
                return t("mue.loadMore.topLoadingText");
            }},
            bottomPullText: {type: String, default: () => {
                return t("mue.loadMore.bottomPullText");
            }},
            bottomDropText: {type: String, default:  () => {
                return t("mue.loadMore.bottomDropText");
            }},
            bottomLoadingText: {type: String, default: () => {
                return t("mue.loadMore.bottomLoadingText");
            }},

            allLoadedText: {type: String, default: () => {
                return t("mue.loadMore.allLoadedText");
            }},

            allLoaded: {type: Boolean, default: false},

            disRefresh: {type: Boolean, default: false},
            disLoadMore: {type: Boolean, default: false},

            pageNo: {type: Number, default: 0},
            pageTotal: {type: Number, default: 0}
        },
        data(){
            return {
                distance: 50,
                scroller: null,
                scrolling: 0, // 0：不滚动， 1：操作触发的滚动， -1：api 触发的滚动
                loading: false,
                top: {state: "", style: {}},
                bottom: {state: "", style: {}},
                translate: 0,
                moreThenView: false,
                posY: 0
            };
        },
        computed: {
            boxStyle(){
                if(this.bottom.state === "loading" && this.scrolling > 0){
                    return {transform: `translateY(${-this.distance}px)`,};
                }
                return {transition: "0.6s"};
            }
        },
        watch: {},
        methods: {
            initScroll(){
                let self = this;
                self.resetStates();
                self.scroller = new BETTER_SCROLL(this.$refs.box, {
                    click: true, probeType: 1, scrollbar: false, momentum: false,
                    scrollY: true, scrollX: false, bindToWrapper: false, startY: this.posY,
                    bounce: {
                        left: false, right: false,
                        top: this.$listeners["refresh"] && !this.disRefresh,
                        bottom: this.$listeners["load-more"] && !this.disLoadMore
                    },
                    pullDownRefresh: {threshold: this.distance, stop: this.distance},
                    pullUpLoad: {threshold: this.distance},
                    eventPassthrough: "horizontal"
                });

                this.scroller.on("scrollStart", () => {
                    self.scrolling = 1;
                    // self.loading = false;
                    // self.top.state = "";
                    // self.top.style = {};
                    // self.bottom.state = "";
                    // self.bottom.style = {};
                });

                this.scroller.on("scroll", ({y}) => {
                    if(self.loading || !self.scrolling || !self.$refs.box || !self.$refs.content){
                        return;
                    }

                    if(y > 0){
                        self.translate = y;
                        self.topPulling();
                        return;
                    }

                    let br = self.$refs.box.getBoundingClientRect();
                    let cr = self.$refs.content.getBoundingClientRect();
                    let t = br.bottom - (cr.top + Math.max(cr.height, br.height));

                    if(y < 0 && t > 0 && this.scrolling > 0){
                        self.translate = t;
                        self.bottomPulling();
                        return;
                    }

                    self.$emit("scroll-change", self.$refs.box, self.$refs.content);

                });

                this.scroller.on("pullingDown", () => {
                    !self.loading && self.top.state === "drop" && self.topAction();
                    this.scroller.finishPullDown();
                });

                this.scroller.on("scrollEnd", ({y}) => {
                    // if(!self.loading){
                    self.scrolling = 0;
                    // }
                });

                this.scroller.on("touchEnd", () => {
                    !self.loading && self.bottom.state === "drop" && self.bottomAction();
                });

                this.scroller.on("pullingUp", () => {
                    self.scroller.finishPullUp();
                });

                this.LoadSuccess();
            },

            topPulling(){
                if(this.loading || this.top.state === "loading" || this.disRefresh
                    || !this.$listeners["refresh"]){
                    return;
                }
                let y = Math.min(parseInt(this.translate), this.distance);
                this.top.style = {top: `${-this.distance + y}px`};
                this.top.state = y < this.distance ? "pull" : "drop";
            },

            topAction(){
                if(this.loading){
                    return;
                }
                this.top.state = "loading";
                this.loading = true;
                this.$emit("refresh", () => {
                    this.LoadSuccess();
                });
            },

            bottomPulling(){
                if(this.loading || this.bottom.state === "loading" || this.disLoadMore
                    || !this.$listeners["load-more"]){
                    return;
                }
                let y = Math.min(parseInt(this.translate), this.distance);
                this.bottom.style = {bottom: `${-this.distance + y}px`};
                this.bottom.state = y < this.distance ? "pull" : "drop";
            },

            bottomAction(){
                if(this.loading || this.allLoaded){
                    return;
                }
                this.bottom.state = "loading";
                this.loading = true;
                this.$emit("load-more", () => {
                    this.LoadSuccess();
                });
            },

            resetStates(){
                this.top.style = {top: `-${this.distance}px`};
                this.bottom.style = {bottom: `-${this.distance}px`};
                this.loading = false;
                this.top.state = "";
                this.bottom.state = "";
                this.scrolling = 0;
            },

            fillContainer(){
                this.$nextTick(() => {
                    let br = this.$refs.box.getBoundingClientRect();
                    let cr = this.$refs.content.getBoundingClientRect();
                    this.moreThenView = cr.height >= br.height;
                    if(!this.autoFill || this.allLoaded){
                        return;
                    }
                    !this.moreThenView && this.bottomAction();
                });
            },

            backTop(){
                this.ScrollTop(0);
            },

            LoadSuccess(){
                if(this.scroller){
                    this.scroller.once("refresh", () => {
                        this.resetStates();
                        this.fillContainer();
                        if(!this.scrolling && this.scroller.y < this.scroller.maxScrollY){
                            this.ScrollTop(0);
                        }
                    });
                    this.scroller.refresh();
                }
                else{
                    this.$nextTick(() => {
                        this.resetStates();
                        this.fillContainer();
                    });
                }
            },

            ScrollTop(t = 0){
                if(!this.scroller){
                    return;
                }
                this.scrolling = -1;
                this.scroller.scrollTo(0, -t, 300);
            }
        },
        mounted(){
            this.initScroll();
        },
        activated(){
            if(!this.scroller){
                this.initScroll();
            }
        },
        deactivated(){
            if(this.scroller){
                this.posY = this.scroller.y;
                this.scroller.destroy();
                this.scroller = null;
            }
        }
    };
</script>