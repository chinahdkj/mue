<template>
    <div class="mue-blue-alarm">

        <audio class="audio" controls preload loop hidden>
            <source src="../../../themes/audio/alarm.mp3" type="audio/mpeg">
        </audio>

        <div class="play_audio" >
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
            times: {type: [String, Number], default: null}
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
                //检查完毕
                let $dom = this.$el.getElementsByClassName("audio")[0]
                if($dom && !this.playing) {
                    this.playing = true;
                    $dom.play()
                }
            },
            stopPlay() {
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
