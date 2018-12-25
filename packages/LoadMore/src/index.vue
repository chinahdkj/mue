<template>
    <div class="mue-load-more">
        <div class="mue-load-more-box" @scroll="onScroll">
            <div class="mue-load-more-wrap">
                <div class="mue-load-more-content"
                     :class="{ 'is-dropped': topDropped || bottomDropped}"
                     :style="{ 'transform': transform }">

                    <div class="mue-load-more-top" v-if="$listeners.refresh">
                    <span class="mue-load-more-text">
                        <i v-if="topStatus !== 'loading'" class="iconfont icon-xiangxiajiantou"
                           aria-hidden="true" :class="{'is-drop': topStatus === 'drop'}"></i>
                        <template v-if="topStatus === 'pull'">
                            {{topPullText}}
                        </template>
                        <template v-else-if="topStatus === 'drop'">
                            {{topDropText}}
                        </template>
                        <template v-else-if="topStatus === 'loading'">
                            {{topLoadingText}}
                        </template>
                    </span>
                    </div>

                    <slot></slot>

                    <div class="mue-load-more-bottom" v-if="$listeners['load-more']">
                        <span v-if="allLoaded" class="mue-load-more-text">
                            {{moreThenView ? "没有更多了" : ""}}
                        </span>
                        <span v-else class="mue-load-more-text">
                        <i v-if="bottomStatus !== 'loading'" aria-hidden="true"
                           class="iconfont icon-xiangxiajiantou-copy"
                           :class="{'is-drop': bottomStatus === 'drop'}"></i>
                        <template v-if="bottomStatus === 'pull'">
                            {{bottomPullText}}
                        </template>
                        <template v-else-if="bottomStatus === 'drop'">
                            {{bottomDropText}}
                        </template>
                        <template v-else-if="bottomStatus === 'loading'">
                            {{bottomLoadingText}}
                        </template>
                    </span>
                    </div>

                </div>
            </div>
        </div>


        <transition name="van-slide-up">
            <div class="mue-load-more-pagination" v-show="pageNo > 1" @click="backTop">
                <div class="__button" :class="{'is-scrolling': scrolling}">
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

                containerFilled: false,
                topText: "",
                topDropped: false,
                bottomText: "",
                bottomDropped: false,
                bottomReached: false,

                direction: '',
                startY: 0,
                startScrollTop: 0,
                currentY: 0,
                topStatus: '',
                bottomStatus: '',

                $content: null,
                $box: null,

                scrolling: false,
                scrollTimer: null,
                moreThenView: false
            };
        },
        computed: {
            transform(){
                return this.translate === 0 ? null :
                       `translate3d(0, ${parseInt(this.translate)}px, 0)`;
            }
        },
        watch: {
            pageNo(v){
                if(!this.$refs.pager){
                    return;
                }
                $(this.$refs.pager).animate({scrollTop: (v - 1) * 20}, 200);
            }
        },
        methods: {
            bottomMethod(){
                let success = () => {
                    this.bottomStatus = "pull";
                    this.bottomDropped = false;
                    this.$box.scrollTop += 50;
                    this.translate = 0;
                    this.fillContainer();
                };

                this.$emit("load-more", success);
            },
            topMethod(){
                let success = () => {
                    this.topStatus = "pull";
                    this.topDropped = false;
                    this.translate = 0;
                    this.fillContainer();
                };
                this.$emit("refresh", success);
            },
            getScrollTop(){
                return this.$box.scrollTop;
            },
            bindTouchEvents(){
                this.$content.addEventListener("touchstart", this.handleTouchStart);
                this.$content.addEventListener("touchmove", this.handleTouchMove);
                this.$content.addEventListener("touchend", this.handleTouchEnd);
            },
            init(){
                this.topStatus = "pull";
                this.bottomStatus = "pull";
                this.$box = this.$el.getElementsByClassName("mue-load-more-box")[0];
                this.$content = this.$el.getElementsByClassName("mue-load-more-wrap")[0];
                this.bindTouchEvents();
                this.fillContainer();

            },
            fillContainer(){
                this.$nextTick(() => {
                    this.moreThenView = this.$box.clientHeight <= this.$content.clientHeight;
                    if(!this.autoFill || this.allLoaded){
                        return;
                    }
                    this.containerFilled = this.$content.getBoundingClientRect().bottom >=
                        this.$box.getBoundingClientRect().bottom;

                    if(!this.containerFilled){
                        this.bottomStatus = "loading";
                        this.bottomMethod();
                    }
                });
            },
            checkBottomReached(){
                return parseInt(this.$content.getBoundingClientRect().bottom) <=
                    parseInt(this.$box.getBoundingClientRect().bottom) + 1;
            },
            handleTouchStart(event){
                this.startY = event.touches[0].clientY;
                this.startScrollTop = this.getScrollTop();
                this.bottomReached = false;
                if(this.topStatus !== "loading"){
                    this.topStatus = "pull";
                    this.topDropped = false;
                }
                if(this.bottomStatus !== "loading"){
                    this.bottomStatus = "pull";
                    this.bottomDropped = false;
                }
            },
            handleTouchMove(event){
                if(this.startY < this.$content.getBoundingClientRect().top && this.startY >
                    this.$content.getBoundingClientRect().bottom){
                    return;
                }
                this.currentY = event.touches[0].clientY;
                let distance = (this.currentY - this.startY) / this.distanceIndex;
                this.direction = distance > 0 ? "down" : "up";
                if(this.$listeners.refresh && !this.disRefresh && this.direction === "down" &&
                    this.getScrollTop() === 0 && this.topStatus !== "loading"){
                    // event.preventDefault();
                    event.stopPropagation();
                    this.translate = distance <= this.maxDistance
                                     ? (distance - this.startScrollTop) : this.translate;
                    if(this.translate < 0){
                        this.translate = 0;
                    }
                    this.topStatus = this.translate >= this.distance ? "drop" : "pull";
                }
                if(this.direction === "up"){
                    this.bottomReached = this.bottomReached || this.checkBottomReached();
                }

                if(this.$listeners["load-more"] && !this.disLoadMore && this.direction === "up" &&
                    this.bottomReached && this.bottomStatus !== "loading"){
                    // event.preventDefault();
                    event.stopPropagation();

                    this.translate = Math.abs(distance) <= this.maxDistance ?
                                     this.getScrollTop() - this.startScrollTop + distance :
                                     this.translate;
                    if(this.translate > 0){
                        this.translate = 0;
                    }
                    this.bottomStatus = -this.translate >= this.distance && !this.allLoaded ?
                                        "drop" : "pull";
                }

            },
            handleTouchEnd(){
                if(this.direction === "down" && this.getScrollTop() === 0 && this.translate > 0){
                    this.topDropped = true;
                    if(this.topStatus === "drop"){
                        this.translate = "50";
                        this.topStatus = "loading";
                        this.topMethod();
                    }
                    else{
                        this.translate = "0";
                        this.topStatus = "pull";
                    }
                }
                if(this.direction === "up" && this.bottomReached && this.translate < 0){
                    this.bottomDropped = true;
                    this.bottomReached = false;
                    if(this.bottomStatus === "drop"){
                        this.translate = "-50";
                        this.bottomStatus = "loading";
                        this.bottomMethod();
                    }
                    else{
                        this.translate = "0";
                        this.bottomStatus = "pull";
                    }
                }
                this.direction = "";
            },

            backTop(){
                $(this.$box).animate({scrollTop: 0}, 400);
            },

            onScroll(){
                clearTimeout(this.scrollTimer);
                this.scrolling = true;
                this.$emit("scroll-change", this.$box.getBoundingClientRect());
                this.scrollTimer = setTimeout(() => {
                    this.scrolling = false;
                }, 1500);
            }
        },
        mounted(){
            this.init();
        }
    };
</script>