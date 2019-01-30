<template>
    <div class="mue-load-more">
        <div class="mue-load-more-box" @scroll.passive="scrollHandler.onScroll"
             :class="{'is-reached': scrollHandler.reached}">
            <div class="mue-load-more-wrap"
                 @touchstart.passive="handleTouchStart($event)"
                 @touchmove.passive="touchHandler.onMove($event)"
                 @touchend.passive="handleTouchEnd()">
                <div class="mue-load-more-content"
                     :class="{ 'is-dropped': top.dropped || bottom.dropped}"
                     :style="{ 'transform': transform }">

                    <div class="mue-load-more-top" v-if="$listeners.refresh">
                    <span class="mue-load-more-text">
                        <i v-if="top.state !== 'loading'" class="iconfont icon-xiangxiajiantou"
                           aria-hidden="true" :class="{'is-drop': top.state === 'drop'}"></i>
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

                    <slot></slot>

                    <div :style="{height: maxDistance + 'px'}"
                         class="mue-load-more-end" v-if="translate > 0 && !moreThenView ">
                    </div>

                    <div class="mue-load-more-bottom" v-if="$listeners['load-more']">
                        <span v-if="allLoaded" class="mue-load-more-text">
                            {{moreThenView ? allLoadedText : ""}}
                        </span>
                        <span v-else class="mue-load-more-text">
                        <i v-if="bottom.state !== 'loading'" aria-hidden="true"
                           class="iconfont icon-xiangxiajiantou-copy"
                           :class="{'is-drop': bottom.state === 'drop'}"></i>
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
            </div>
        </div>


        <transition name="van-slide-up">
            <div class="mue-load-more-pagination" v-show="pageNo > 1" @click="backTop">
                <div class="__button" :class="{'is-pager': scrollHandler.showPager}">
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
    import {createAnimationFrame} from "../../../src/utils/dom";

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
                maxDistance: 70,
                distance: 50,
                distanceIndex: 2,
                translate: 0,
                $content: null,
                $box: null,

                moreThenView: false,

                scrollHandler: {
                    onScroll: () => {
                    },
                    scrolling: false,
                    showPager: false,
                    pagerTimer: null,
                    position: {left: 0, top: 0}
                },
                top: {
                    state: "pull",
                    reached: true,
                    dropped: false
                },
                bottom: {
                    state: "pull",
                    reached: true,
                    dropped: false
                },
                touchHandler: {
                    start: null,
                    direction: "",
                    onMove: (event) => {
                    }
                }
            };
        },
        computed: {
            transform(){
                if(this.translate === 0){
                    return null;
                }
                let translate = !this.top.reached && !this.bottom.reached
                                ? 0 : parseInt(this.translate);
                if(translate < -this.maxDistance){
                    translate = -this.maxDistance;
                }
                if(translate > this.maxDistance){
                    translate = this.maxDistance;
                }
                return this.translate === 0 ? null : `translateY(${translate}px)`;
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
            bottomMethod(disScroll = false){
                let success = () => {
                    this.LoadSuccess();
                    !disScroll && this.$nextTick(() => {
                        this.ScrollTop(this.getScrollTop() + 50);
                    });
                };

                this.$emit("load-more", success);
            },
            topMethod(){
                this.$emit("refresh", this.LoadSuccess);
            },
            getScrollTop(){
                return this.$box.scrollTop;
            },
            init(){
                this.$box = this.$el.getElementsByClassName("mue-load-more-box")[0];
                this.$content = this.$el.getElementsByClassName("mue-load-more-wrap")[0];

                this.scrollHandler.onScroll = createAnimationFrame(this.onScroll);
                this.touchHandler.onMove = createAnimationFrame(this.handleTouchMove);
                this.resetStates();
                this.fillContainer();
            },
            fillContainer(){
                this.$nextTick(() => {
                    this.moreThenView = this.$box.clientHeight <= this.$content.clientHeight;
                    if(!this.autoFill || this.allLoaded){
                        return;
                    }
                    // 数据未填充满，再加载
                    if(!this.moreThenView){
                        this.bottomStatus = "loading";
                        this.bottomMethod(true);
                    }
                });
            },

            handleTouchStart(event){
                if(!this.top.reached && !this.bottom.reached){
                    this.translate = 0;
                    return;
                }
                this.touchHandler.start = event.touches[0].clientY;
                this.touchHandler.direction = "";

                if(this.top.state !== "loading"){
                    this.top.state = "pull";
                    this.top.dropped = false;
                }
                if(this.bottom.state !== "loading"){
                    this.bottom.state = "pull";
                    this.bottom.dropped = false;
                }
            },
            handleTouchMove(event){
                if(this.touchHandler.start == null){
                    return;
                }
                let current = event.touches[0].clientY;
                let distance = (current - this.touchHandler.start) / this.distanceIndex;

                // 顶部下拉
                if(distance > 0 && this.top.reached && this.$listeners.refresh &&
                    !this.disRefresh && this.top.state !== "loading"){
                    this.touchHandler.direction = "down";
                    this.translate = distance;
                    this.top.state = this.translate >= this.distance ? "drop" : "pull";
                    return;
                }

                // 底部上拉
                if(distance < 0 && this.bottom.reached && this.$listeners["load-more"] &&
                    !this.disLoadMore && this.bottom.state !== "loading"){
                    this.touchHandler.direction = "up";
                    this.translate = distance;
                    this.bottom.state = -this.translate >= this.distance && !this.allLoaded
                                        ? "drop" : "pull";
                    return;
                }

                this.touchHandler.direction = "";

            },
            handleTouchEnd(){
                if(this.touchHandler.direction === "down" && this.translate > 0){
                    this.top.dropped = true;
                    if(this.top.state === "drop" && this.translate >= this.distance){
                        this.translate = this.distance;
                        this.top.state = "loading";
                        this.topMethod();
                        return;
                    }
                }

                if(this.touchHandler.direction === "up" && this.translate < 0){
                    this.bottom.dropped = true;
                    if(this.bottom.state === "drop" && -this.translate >= this.distance){
                        this.translate = -this.distance;
                        this.bottom.state = "loading";
                        this.bottomMethod();
                        return;
                    }
                }

                this.touchHandler.start = null;
                this.translate = 0;
                this.direction = "";
                this.bottom.state = "pull";
                this.top.state = "pull";
            },

            backTop(){
                this.ScrollTop(0);
            },

            onScroll(){
                this.scrollHandler.position.left = this.$box.scrollLeft;
                this.scrollHandler.position.top = this.$box.scrollTop;

                let boxRect = this.$box.getBoundingClientRect();
                let cntRect = this.$content.getBoundingClientRect();
                this.top.reached = boxRect.top === cntRect.top;
                this.bottom.reached = boxRect.bottom >= cntRect.bottom;
                this.$emit("scroll-change", this.$box, this.$content);

                clearTimeout(this.scrollHandler.pagerTimer);

                this.scrollHandler.showPager = true;
                this.scrollHandler.pagerTimer = setTimeout(() => {
                    this.scrollHandler.showPager = false;
                }, 1500);

            },

            resetStates(){
                this.translate = 0;
                this.touchHandler.direction = "";

                this.bottom.state = "pull";
                this.bottom.dropped = false;

                this.top.state = "pull";
                this.top.dropped = false;

                this.$nextTick(()=>{
                    let boxRect = this.$box.getBoundingClientRect();
                    let cntRect = this.$content.getBoundingClientRect();
                    this.top.reached = boxRect.top === cntRect.top;
                    this.bottom.reached = boxRect.bottom >= cntRect.bottom;
                });
            },

            LoadSuccess(){
                this.resetStates();
                this.fillContainer();
            },

            ScrollTop(t = 0){
                $(this.$box).animate({scrollTop: t}, 400);
            }
        },
        mounted(){
            this.init();
        },
        activated(){
            this.$nextTick(()=>{
                this.$box.scrollTop = this.scrollHandler.position.top;
                this.$box.scrollLeft = this.scrollHandler.position.left;
            });
        }
    };
</script>