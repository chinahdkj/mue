<template>
    <div class="mue-blue-alarm">

        <audio class="audio" controls preload loop hidden>
            <source src="../../../themes/audio/alarm.mp3" type="audio/mpeg">
        </audio>

        <div class="play_audio">
            <i v-if="!playing" class="play iconfont icon-xiangzuo"></i>
            <i v-else class="play fa fa-pause" @click="stopPlay"></i>
        </div>

    </div>
</template>

<script>
    import {localeMixin, t} from "../../../src/locale";

    export default {
        name: "MueBlueAlarm",
        mixins: [localeMixin],
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
            times: {type: [String, Number], default: null},
            url: {type: String, default: ""},
            id: {type: String, default: ""}
        },
        data() {
            return {
                /*resData: [
                    {
                        "qtnd": "0.4", // 气体浓度, float (解析后的 int * 0.1)
                        "gjzt": "0", // 告警状态, int [0:无报警, 1:低报警, 2:高报警]
                        "qtmc": "o2", // 气体名称, string
                        "fdbs": "", // 放大倍数, int [0:无放大, 1:10倍, 2:100倍, 3:1000倍]
                        "qtdw": "", // 气体单位, int [0:PPM, 1:%VOL, 2:%LEL, 3:PPHM, 4:Mg/m3, 5:PPB, 6:Mgl]
                        "qtdbd": "5", // 气体低报点, float (解析后的 int * 0.1)
                        "qtgbd": "10", // 气体高报点, float (解析后的 int * 0.1)
                    },
                    {
                        "qtnd": "8", // 气体浓度, float (解析后的 int * 0.1)
                        "gjzt": "0", // 告警状态, int [0:无报警, 1:低报警, 2:高报警]
                        "qtmc": "co2", // 气体名称, string
                        "fdbs": "", // 放大倍数, int [0:无放大, 1:10倍, 2:100倍, 3:1000倍]
                        "qtdw": "", // 气体单位, int [0:PPM, 1:%VOL, 2:%LEL, 3:PPHM, 4:Mg/m3, 5:PPB, 6:Mgl]
                        "qtdbd": "5", // 气体低报点, float (解析后的 int * 0.1)
                        "qtgbd": "10", // 气体高报点, float (解析后的 int * 0.1)
                    }
                ],*/
                resData: [],
                playing: false,
                timer: null
            };
        },
        computed: {},
        watch: {},
        methods: {
            //检测数据，发起警报
            _checkAlarm() {
                //ios下原生audio无法自动触发play方法
                if(this.$comm.isIos()) {
                    console.log(window.location);
                    let idx = window.location.href.indexOf('/index.html#/');
                    if(idx > -1) {
                        let url = window.location.href.substring(0, idx);
                        let audioPath = `${url}/static/media/alarm.ee3a3349.mp3`;
                        this.$native.soundPlay({params: {path: audioPath, loopPlay: true, hiddenView: true}});
                        this.playing = true;
                    } else {
                        this.$toast("报警音频资源未找到");
                    }
                    return
                }

                let $dom = this.$el.getElementsByClassName("audio")[0]
                if($dom && !this.playing) {
                    this.playing = true;
                    $dom.play()
                }

            },

            stopPlay() {
                if(this.$comm.isIos()) {
                    this.$native.soundPlay({value: 'stop'});
                    this.playing = false;
                    return
                }

                let $dom = this.$el.getElementsByClassName("audio")[0]
                if($dom) {
                    this.playing = false
                    $dom.pause();
                }
            },
            getData() {
                if(!this.times) {
                    this.bluetoothing();
                    return
                }
                setTimeout(async () => {
                    await this.bluetoothing()
                    this.getData();
                }, this.times * 1000)
            },
            bluetoothing() {
                return new Promise((resolve, reject) => {
                    this.$native.eranntex_params({
                        params: {},
                        cb: (res) => {
                            if(res.code === 0 && res.response) {
                                this.resData = res.response.get || [];

                                this.$native.saveLocalData({
                                    params: {
                                        type: "blue-alarm", state: "1",
                                        datas: [{
                                            //"_id": new Date().getTime(),
                                            "_id": this.id,
                                            "c1": "",
                                            "c2": "",
                                            "c3": "",
                                            "c4": "",
                                            "c5": "",
                                            "c6": this.url,
                                            "data": JSON.stringify({"blueAlarm": this.resData})
                                        }]
                                    },
                                    cb: (result) => {

                                    }
                                });

                                this.$emit("loaded", this.resData);
                                resolve();
                            } else {
                                this.$toast(res.msg);
                                reject(res.msg)
                            }
                        }
                    });
                })
            }
        },
        beforeMount() {
            this.getData();
        }
    }
</script>
