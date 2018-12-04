<template>
    <div class="mue-load-more">
        <div class="mue-load-more-wrap">
            <div class="mue-load-more-content"
                 :class="{ 'is-dropped': topDropped || bottomDropped}"
                 :style="{ 'transform': transform }">

                <div class="mue-load-more-top" v-if="$listeners.refresh">
                    <span class="mue-load-more-text">
                        <i class="iconfont icon-jiantou-down" aria-hidden="true"></i>
                        {{topText }}</span>
                </div>

                <slot></slot>

                <div class="mue-load-more-bottom" v-if="$listeners['load-more']">
                    <span v-if="allLoaded" class="mue-load-more-text">没有更多了</span>
                    <span v-else class="mue-load-more-text">
                        <i class="iconfont icon-jiantou-up" aria-hidden="true"></i>
                        {{ bottomText }}</span>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "MueLoadMore",
        components: {},
        props: {
            autoFill: {type: Boolean, default: true},

            topPullText: {type: String, default: "下拉可以刷新"},
            topDropText: {type: String, default: "下拉可以刷新"},
            topLoadingText: {type: String, default: "刷新中..."},

            bottomPullText: {type: String, default: "上拉加载更多"},
            bottomDropText: {type: String, default: "上拉加载更多"},
            bottomLoadingText: {type: String, default: "加载中..."},

            allLoaded: {type: Boolean, default: false},

            disRefresh: {type: Boolean, default: false},
            disLoadMore: {type: Boolean, default: false},
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

                $content: null
            };
        },
        computed: {
            transform(){
                return this.translate === 0 ? null : 'translate3d(0, ' + this.translate + 'px, 0)';
            }
        },
        watch: {
            topStatus(val){
                switch(val){
                    case "pull":
                        this.topText = this.topPullText;
                        break;
                    case "drop":
                        this.topText = this.topDropText;
                        break;
                    case "loading":
                        this.topText = this.topLoadingText;
                        break;
                }
            },
            bottomStatus(val){
                switch(val){
                    case "pull":
                        this.bottomText = this.bottomPullText;
                        break;
                    case "drop":
                        this.bottomText = this.bottomDropText;
                        break;
                    case "loading":
                        this.bottomText = this.bottomLoadingText;
                        break;
                }
            }
        },
        methods: {
            bottomMethod(){
                let success = () => {
                    this.bottomStatus = "pull";
                    this.bottomDropped = false;
                    this.$el.scrollTop += 50;
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
                return this.$el.scrollTop;
            },
            bindTouchEvents(){
                this.$content.addEventListener("touchstart", this.handleTouchStart);
                this.$content.addEventListener("touchmove", this.handleTouchMove);
                this.$content.addEventListener("touchend", this.handleTouchEnd);
            },
            init(){
                this.topStatus = "pull";
                this.bottomStatus = "pull";
                this.$content = this.$el.getElementsByClassName("mue-load-more-wrap")[0];
                this.bindTouchEvents();
                this.fillContainer();

            },
            fillContainer(){
                if(!this.autoFill || this.allLoaded){
                    return;
                }
                this.$nextTick(() => {
                    this.containerFilled = this.$content.getBoundingClientRect().bottom >=
                        this.$el.getBoundingClientRect().bottom;

                    if(!this.containerFilled){
                        this.bottomStatus = "loading";
                        this.bottomMethod();
                    }
                });
            },
            checkBottomReached(){
                return parseInt(this.$content.getBoundingClientRect().bottom) <=
                    parseInt(this.$el.getBoundingClientRect().bottom) + 1;
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
            }
        },
        mounted(){
            this.init();
        }
    };
</script>