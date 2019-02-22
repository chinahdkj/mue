<template>
    <mue-container>
        <mue-header>
            <van-tabs v-model="current">
                <van-tab v-for="(t, i) in tabs" :key="i">
                    <i slot="title" class="iconfont" :class="t.icon" style="font-size: 28px;"/>
                </van-tab>
            </van-tabs>
        </mue-header>

        <mue-main v-resize="resize">
            <div :style="{'padding-left': gutter + 'px'}">
                <template v-if="selectable">
                    <div v-for="i in row * col" :key="i" style="float: left"
                         :style="{'margin-top': gutter + 'px', 'margin-right': gutter + 'px'}">
                        <mue-dvr-video ref="video" :width="size.width" :height="size.height"
                                       :name="(videos[i] || {}).name" :rtsp="(videos[i] || {}).rtsp"
                                       :thumb="(videos[i] || {}).thumb" @choose="pickCamera(i)"/>
                    </div>
                </template>
                <template v-else>
                    <div v-for="(c, i) in cameras" :key="i" style="float: left"
                         :style="{'margin-top': gutter + 'px', 'margin-right': gutter + 'px'}">
                        <mue-dvr-video :width="size.width" :height="size.height"
                                       :name="c.name" :rtsp="c.rtsp" :thumb="c.thumb"/>
                    </div>
                </template>

                <div :style="{height: gutter + 'px'}"></div>
            </div>
        </mue-main>

        <van-popup v-if="selectable" ref="pop" v-model="pop.visible" position="bottom"
                   get-container="body">
            <van-picker ref="picker" :columns="cameras" show-toolbar @confirm="setCamera"
                        @cancel="pop.visible = false" value-key="name"/>
        </van-popup>
    </mue-container>
</template>

<script>
    export default {
        name: "MueDvr",
        components: {},
        props: {
            cameras: {type: Array, default: []},
            selectable: {type: Boolean, default: false}
        },
        data(){
            return {
                gutter: 6,
                width: 0,
                current: 0,
                tabs: [
                    {row: 2, col: 1, icon: "icon-danlie"},
                    {row: 2, col: 2, icon: "icon-lianglie"},
                    {row: 3, col: 3, icon: "icon-sanlie"}
                ],
                videos: {},
                pop: {
                    visible: false, index: 0,
                    columns: [],
                }
            };
        },
        computed: {
            col(){
                return this.tabs[this.current].col;
            },
            row(){
                return this.tabs[this.current].row;
            },
            size(){
                let width = this.width - (this.col - 1) * this.gutter;
                width = width / this.col;
                let height = width * (this.col === 1 ? 0.5625 : 0.75);
                return {width, height};
            }
        },
        watch: {
            current(){
                this.selectable && this.$nextTick(() => {
                    Object.keys(this.videos).forEach((k) => {
                        k > this.col * this.row && this.$delete(this.videos, k);
                    });
                });
            }
        },
        methods: {
            resize(){
                this.width = this.$el.clientWidth - 2 * this.gutter;
            },
            pickCamera(i){
                this.pop.visible = true;
                this.$nextTick(() => {
                    this.pop.index = i;
                    let checked = this.videos[this.pop.index];
                    let index = 0;
                    if(checked){
                        index = this.cameras.findIndex((c) => {
                            return c.code === checked.code;
                        });
                    }
                    this.$refs.picker.setColumnIndex(0, index);
                });
            },
            setCamera(){
                this.pop.visible = false;

                let value = this.$refs.picker.getColumnValue(0);
                this.$set(this.videos, this.pop.index, {...value});
                this.$nextTick(() => {
                    this.$refs.video[this.pop.index - 1].Play();
                });
            },

            GetView(){
                return {layout: this.current, videos: this.videos};
            },
            SetView({layout, videos}, autoPlay = false){
                this.current = layout;
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
