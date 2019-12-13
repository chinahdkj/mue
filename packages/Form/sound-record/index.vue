<template>
    <div class="mue-sound-record">

        <ul class="mue-sound-record-list">
            <!--<li class="record_audio" @click="showAction(0)">
                <i class="play iconfont icon-xiangzuo"></i>
            </li>-->
            <li class="record_audio" v-for="(a,i) in audios" :key="i" @click="showAction(i)">
                <i class="play iconfont icon-xiangzuo"></i>
            </li>
            <li class="_record-btn" v-if="!isReadonly && recordAble">
                <i v-if="recording" class="recording"></i>
                <button v-else class="record-btn" :disabled="disabled" @click="recordAudio()" :class="{'is-disabled': disabled}">
                </button>
            </li>
        </ul>

        <van-actionsheet v-model="pop.visible" get-container="body" cancel-text="取消"
                         @select="onSelect"
                         :actions="[{name: '播放音频', act: 'play'}, {name: '删除', act: 'delete'}]"/>
    </div>
</template>

<script>
    export default {
        name: "MueSoundRecord",
        components: {},
        inject: {
            FORM_ITEM: {
                from: "FORM_ITEM",
                default() {
                    return {};
                }
            }
        },
        props: {
            value: {type: [String, Array], default: ""},
            disabled: {type: Boolean, default: false},
            readonly: {type: Boolean, default: false},
            multiple: {type: Boolean, default: false},
            local: {type: Boolean, default: false},
            limit: {type: Number, default: 5}
        },
        data() {
            return {
                audios: [],
                recording: false,
                dict: {},
                pop: {visible: false},
                current: -1
            };
        },
        computed: {
            recordAble() {
                if (!this.multiple) {
                    return this.audios.length < 1;
                }
                return this.limit > 0 ? this.audios.length < this.limit : true;
            },
            isReadonly(){
                return this.FORM_ITEM.readonly || this.readonly;
            }
        },
        watch: {
            value: {
                immediate: true, deep: true,
                handler(v) {
                    let temp = [];
                    if (!v) {
                    }
                    else if (Array.isArray(v)) {
                        temp = v;
                    } else {
                        temp = [v];
                    }
                    this.audios = temp;
                }
            },
            audios: {
                deep: true, immediate: true,
                handler(v) {
                    if (!Array.isArray(v)) {
                        return
                    }

                    if (this.multiple) {
                        this.$emit("input", v);
                    }
                    else {
                        this.$emit("input", v.length === 0 ? "" : v[0]);
                    }

                    this.dict = {};
                    v.forEach((p) => {
                        this.$set(this.dict, p, {
                            url: p,
                            path: this.getPath(p),
                            local: false
                        });
                    });

                    if (this.local) {
                        let prms = v.map((p) => {
                            return this.queryLocal(p);
                        });

                        Promise.all(prms).then((datas) => {
                            for (let i = 0; i < datas.length; i++) {
                                let {_id, data} = datas[i];
                                if (!_id) {
                                    continue;
                                }
                                data = JSON.parse(data);
                                this.$set(this.dict, _id, {
                                    url: _id,
                                    path: data.path,
                                    local: true
                                });
                            }
                        });
                    }
                }
            }
        },
        methods: {
            showAction(i) {
                this.current = i;
                if (this.isReadonly) {
                    this.play();
                    return;
                }
                this.pop.visible = true;
            },
            play() {
                if(!this.audios.length) {
                    return;
                }
                let audioPath = this.dict[this.audios[this.current]].path;
                this.$native.soundPlay({params: {path: audioPath}});
            },
            onSelect({act}) {
                if (act === "play") {
                    this.play();
                }
                else if (act === "delete") {
                    this.removeAudio();
                }
                this.pop.visible = false;
            },
            removeAudio() {
                if (this.disabled) {
                    return;
                }
                this.$dialog.confirm({
                    title: "删除", message: "是否删除此文件!"
                }).then(() => {
                    let id = this.audios[this.current], info = this.dict[id] || {};
                    this.audios.splice(this.current, 1);

                    if (info.local) {
                        // 删除原生本地数据库数据
                        this.$native.deleteLocalData({
                            params: {datas: [{key: '_id', value: id}]}
                        });
                        // 删除原生本地文件
                        this.$native.delFile({
                            params: {path: info.path}
                        });
                    }

                }).catch(() => {
                });
            },
            getPath(whole) {
                if (!whole) {
                    return "";
                }
                if (whole.startsWith("/upload")) {
                    return `${this.$comm.getHost()}${whole}?appid=${this.$comm.getAppId()}`;
                }
                return whole;
            },
            queryLocal(id) {
                return new Promise((resolve) => {
                    return this.$native.queryLocalData({
                        params: {datas: [{key: "_id", value: id}]},
                        cb: ({datas}) => {
                            resolve(datas.length === 0 ? {} : datas[0]);
                        }
                    });
                })
            },
            recordAudio() {
                this.recording = true;
                let id = this.$comm.newFilePath('mp3');
                this.$native.sound({
                        params: {id: id, local: this.local},
                        cb: ({code}) => {
                            if (code === 0) {
                                this.audios.push(id);
                            } else if (code === 1) {
                            } else {
                                this.$toast.fail('录制失败');
                            }
                            this.recording = false;
                        }
                    },
                );
            }
        }
    }
</script>