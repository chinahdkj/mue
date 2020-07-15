<template>
    <div class="mue-blue-alarm">

        <audio class="audio" controls preload loop hidden>
            <source src="../../../themes/audio/alarm.mp3" type="audio/mpeg">
        </audio>

        <div class="play_audio" >
            <i v-if="!playing" class="play iconfont icon-xiangzuo"></i>
            <i v-else class="play fa fa-pause" @click="stopPlay"></i>

        </div>


        <!--<ul class="mue-sound-record-list">
            &lt;!&ndash;<li class="record_audio" @click="showAction(0)">
                <i class="play iconfont icon-xiangzuo"></i>
            </li>&ndash;&gt;
            <li class="record_audio" v-for="(a,i) in audios" :key="i" @click="showAction(i)">
                <i class="play iconfont icon-xiangzuo"></i>
            </li>
            <li class="_record-btn" v-if="!isReadonly && recordAble">
                <i v-if="recording" class="recording"></i>
                <button v-else class="record-btn" :disabled="disabled" @click="recordAudio()" :class="{'is-disabled': disabled}">
                </button>
            </li>
        </ul>

        <van-actionsheet v-model="pop.visible" get-container="body" :cancel-text="t('mue.common.cancel')"
                         @select="onSelect"
                         :actions="[{name: t('mue.form.soundRecord.playText'), act: 'play'}, {name: t('mue.common.delete'), act: 'delete'}]"/>-->
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

<style lang="less">
    .mue-blue-alarm{
        display: inline-block;
        padding: 5px 0 0 5px;
        box-sizing: border-box;
        min-width: 55px;
        max-width: 100%;
        background: #ffffff;
        width: 100%;
        .play_audio {
            display: block;
            box-sizing: border-box;
            height: 50px;
            width: 50px;
            border: 2px solid #e0e0e0;
            margin: 2px 5px 2px 0;
            overflow: hidden;
            position: relative;
            border-radius: 50%;
            float:left;
            .play {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                font-size: 24px;
                color: #757575;
            }
        }
    }
</style>
