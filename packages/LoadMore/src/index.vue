<template>
    <div class="mue-load-more">
        <div class="mue-load-more__box" ref="box" :style="boxStyle">
            <div class="mue-load-more__wrap">
                <div class="mue-load-more__content" ref="content" v-resize="refScroll">
                    <slot></slot>
                </div>
            </div>

            <div v-show="scrolling && $listeners['refresh'] && !disRefresh && top.state"
                 class="mue-load-more__top" :style="top.style">
                <span class="mue-load-more__text">
                    <i v-show="top.state != 'loading'" class="iconfont icon-xiangxiajiantou"
                       :class="{'is-drop': top.state === 'drop'}" aria-hidden="true"/>
                    <template v-if="top.state === 'pull'">
                        {{topPullText}}
                    </template>
                    <template v-else-if="top.state === 'drop'">
                        {{topDropText}}
                    </template>
                    <template v-else-if="top.state === 'loading'">
                        {{topLoadingText}}
                    </template>
                </span>
            </div>

            <div v-show="scrolling && $listeners['load-more'] && !disLoadMore && bottom.state"
                 class="mue-load-more__bottom"
                 :style="bottom.state != 'loading' ? bottom.style : {bottom: -distance + 'px'}">
                <span v-if="allLoaded" class="mue-load-more__text">
                    {{moreThenView ? allLoadedText : ""}}
                </span>

                <span v-else class="mue-load-more__text">
                    <i v-if="bottom.state != 'loading'" aria-hidden="true"
                       class="iconfont icon-xiangxiajiantou-copy"
                       :class="{'is-drop': bottom.state === 'drop'}"/>
                    <template v-if="bottom.state === 'pull'">
                        {{bottomPullText}}
                    </template>
                    <template v-else-if="bottom.state === 'drop'">
                        {{bottomDropText}}
                    </template>
                    <template v-else-if="bottom.state === 'loading'">
                        {{bottomLoadingText}}
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
                    <a class="__pager">
                        <ul ref="pager">
                            <li v-for="i in pageTotal" :key="i">
                                {{i}}
                            </li>
                        </ul>
                        <span>{{pageTotal}}</span>
                    </a>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>

    import BETTER_SCROLL from "better-scroll";

    export default {
        name: "MueLoadMore",
        components: {},

        props: {
            autoFill: {type: Boolean, default: true},

            topPullText: {type: String, default: "下拉可以刷新"},
            topDropText: {type: String, default: "释放开始刷新"},
            topLoadingText: {type: String, default: "刷新中..."},

            bottomPullText: {type: String, default: "上拉加载更多"},
            bottomDropText: {type: String, default: "释放开始加载"},
            bottomLoadingText: {type: String, default: "加载中..."},

            allLoadedText: {type: String, default: "没有更多了"},

            allLoaded: {type: Boolean, default: false},

            disRefresh: {type: Boolean, default: false},
            disLoadMore: {type: Boolean, default: false},

            pageNo: {type: Number, default: 0},
            pageTotal: {type: Number, default: 0},
        },
        data(){
            return {
                distance: 50,
                scroller: null,
                scrolling: false,
                loading: false,
                top: {state: "", style: {}},
                bottom: {state: "", style: {}},
                translate: 0,
                moreThenView: false
            };
        },
        computed: {
            boxStyle(){
                if(this.bottom.state === "loading" && this.scrolling){
                    return {transform: `translateY(${-this.distance}px)`,};
                }
                return {transition: "0.6s"};
            }
        },
        watch: {
            pageNo(v){
                if(!this.$refs.pager){
                    return;
                }
                $(this.$refs.pager).animate({scrollTop: (v - 1) * 22}, 200);
            }
        },
        methods: {
            initScroll(){
                let self = this;
                self.resetStates();
                self.scroller = new BETTER_SCROLL(this.$refs.box, {
                    click: true, probeType: 1, scrollbar: false, bounce: true,
                    bounceTime: 600, scrollY: true, scrollX: false, bindToWrapper: false,
                    pullDownRefresh: {threshold: this.distance, stop: this.distance},
                    pullUpLoad: {threshold: this.distance}, eventPassthrough: "horizontal"
                });

                this.scroller.on("scrollStart", () => {
                    self.scrolling = true;
                    self.loading = false;
                    self.top.state = "";
                    self.top.style = {};
                    self.bottom.state = "";
                    self.bottom.style = {};
                });

                this.scroller.on("scroll", ({y}) => {
                    if(!self.scrolling){
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

                    if(y < 0 && t > 0){
                        self.translate = t;
                        self.bottomPulling();
                        return;
                    }

                    self.$emit("scroll-change", self.$refs.box, self.$refs.content);

                });

                this.scroller.on("pullingDown", () => {
                    self.top.state === "drop" && self.topAction();
                });

                this.scroller.on("scrollEnd", () => {
                    if(!self.loading){
                        self.scrolling = false;
                    }
                });

                this.scroller.on("touchEnd", () => {
                    self.bottom.state === "drop" && self.bottomAction();
                });

                this.LoadSuccess();
            },
            refScroll(){
                this.scroller && this.scroller.refresh();
            },

            topPulling(){
                if(this.top.state === "loading" || this.disRefresh || !this.$listeners["refresh"]){
                    return;
                }
                this.loading = true;
                let y = Math.min(parseInt(this.translate), this.distance);
                this.top.style = {top: `${-this.distance + y}px`};
                this.top.state = y < this.distance ? "pull" : "drop";
            },

            topAction(){
                this.top.state = "loading";
                this.$emit("refresh", () => {
                    this.LoadSuccess();
                });
            },

            bottomPulling(){
                if(this.bottom.state === "loading" || this.disLoadMore ||
                    !this.$listeners["load-more"]){
                    return;
                }
                this.loading = true;
                let y = Math.min(parseInt(this.translate), this.distance);
                this.bottom.style = {bottom: `${-this.distance + y}px`};
                this.bottom.state = y < this.distance ? "pull" : "drop";
            },

            bottomAction(){
                if(this.allLoaded){
                    return;
                }
                this.bottom.state = "loading";
                this.$emit("load-more", () => {
                    this.LoadSuccess();
                });
            },

            resetStates(){
                this.top.style = {top: `-${this.distance}px`};
                this.bottom.style = {bottom: `-${this.distance}px`};
                if(this.scroller){
                    this.scroller.finishPullDown();
                    this.scroller.refresh();
                }
                this.loading = false;
                this.top.state = "";
                this.bottom.state = "";
                this.scrolling = false;
            },

            fillContainer(){
                if(!this.autoFill || this.allLoaded){
                    return;
                }
                this.$nextTick(() => {
                    let br = this.$refs.box.getBoundingClientRect();
                    let cr = this.$refs.content.getBoundingClientRect();
                    this.moreThenView = cr.height >= br.height;
                    !this.moreThenView && this.bottomAction();
                });
            },

            backTop(){
                this.ScrollTop(0);
            },

            LoadSuccess(){
                this.resetStates();
                this.fillContainer();
            },

            ScrollTop(t = 0){
                if(!this.scroller){
                    return;
                }
                this.scrolling = true;
                this.scroller.scrollTo(0, -t, 600);
            }
        },
        mounted(){
            this.initScroll();
        },
        activated(){
            this.scroller && this.scroller.enable();
        },
        deactivated(){
            this.scroller && this.scroller.disable();
        }
    };
</script>