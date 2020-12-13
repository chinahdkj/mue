<template>
    <mue-container class="mue-dvr">
        <mue-header>
            <van-tabs v-model="layout">
                <van-tab v-for="(t, i) in tabs" :key="i">
                    <i slot="title" class="iconfont" :class="t.icon" style="font-size: 28px;"/>
                </van-tab>
            </van-tabs>
        </mue-header>

        <mue-main v-resize="resize">
            <div :style="{'padding-left': gutter + 'px'}">
                <template v-if="selectable">
                    <!--视频可选择切换，按行列渲染格子-->
                    <div v-for="i in row * col" :key="i" style="float: left"
                         :style="{'margin-top': gutter + 'px', 'margin-right': gutter + 'px'}">
                        <mue-dvr-video ref="video" :width="size.width" :height="size.height"
                                       :name="(videos[i] || {}).name" :rtsp="(videos[i] || {}).rtsp"
                                       :name-higher="nameHigher" :show-switch-cn="showSwitchCn"
                                       :definition="definition" @choose="pickCamera(i)"/>
                    </div>
                </template>
                <template v-else>
                    <!--视频不能选择切换，按照cameras 参数进行平铺-->
                    <div v-for="(c, i) in cameras" :key="i" style="float: left"
                         :style="{'margin-top': gutter + 'px', 'margin-right': gutter + 'px'}">
                        <mue-dvr-video :width="size.width" :height="size.height"
                                       :name-higher="nameHigher" :show-switch-cn="showSwitchCn"
                                       :definition="definition" :name="c.name" :rtsp="c.rtsp"/>
                    </div>
                </template>

                <div :style="{height: gutter + 'px'}"></div>
            </div>
            <mue-select style="display: none;" ref="pop" :data="cameras" v-model="pop.current"
                        @change="setCamera" searchable></mue-select>
        </mue-main>

    </mue-container>
</template>

<script>
    export default {
        name: "MueDvr",
        components: {},
        props: {
            cameras: {type: Array, default: []},
            selectable: {type: Boolean, default: false},
            tabs: {
                type: Array, default() {
                    return [
                        {row: 2, col: 1, icon: "icon-danlie"},
                        {row: 2, col: 2, icon: "icon-lianglie"},
                        {row: 3, col: 3, icon: "icon-sanlie"}
                    ]
                }
            },
            nameHigher: {type: Boolean, default: false},
            showSwitchCn: {type: Boolean, default: false},
            definition: {type: String, default: "ordinary"}
        },
        data() {
            return {
                gutter: 6,
                width: 0,
                layout: 0,
                videos: {},
                pop: {
                    index: 0, current: null
                }
            };
        },
        computed: {
            col() {
                return this.tabs[this.layout].col;
            },
            row() {
                return this.tabs[this.layout].row;
            },
            size() {
                let width = this.width - (this.col - 1) * this.gutter;
                width = width / this.col;
                let height = width * (this.col === 1 ? 0.5625 : 0.75);
                return {width, height};
            }
        },
        watch: {
            layout() {
                this.selectable && this.$nextTick(() => {
                    Object.keys(this.videos).forEach((k) => {
                        k > this.col * this.row && this.$delete(this.videos, k);
                    });
                });

                this.$emit("change-layout", this.layout);
            }
        },
        methods: {
            resize() {
                this.width = this.$el.clientWidth - 2 * this.gutter;
            },
            pickCamera(i) {
                this.pop.index = i;
                this.pop.current = (this.videos[i] || {}).code || null;
                this.$nextTick(() => {
                    this.$refs.pop.ShowPop();
                });
            },
            setCamera(v) {
                let opt = {...this.$refs.pop.GetOptionInfo(v)};
                this.$set(this.videos, this.pop.index, opt);
                this.$nextTick(() => {
                    this.$refs.video[this.pop.index - 1].Play();
                });
                this.$emit("choose-video", this.pop.index - 1, opt);
            },

            GetView() {
                // 读取当前视频布局信息
                return {layout: this.layout, videos: this.videos};
            },
            SetView({layout, videos}, autoPlay = false) {
                // 设置视频布局
                this.layout = layout;
                this.$set(this, "videos", {});
                this.selectable && this.$nextTick(() => {
                    this.$set(this, "videos", videos);
                    autoPlay && this.$refs.video.forEach(($v) => {
                        $v.Play();
                    });
                });
            }
        }
    }
</script>
