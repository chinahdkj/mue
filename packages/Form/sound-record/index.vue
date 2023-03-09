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
                <button v-else class="record-btn" :disabled="disabled" type="button" @click="recordAudio" :class="{'is-disabled': disabled}"
                        @touchstart="recordAudioStart"
                        @touchmove="recordAudioMove"
                        @touchend="recordAudioEnd"/>
            </li>
        </ul>

        <van-popup v-model="isHolder" :close-on-click-overlay="true" class="record-popup" lock-scroll get-container>
            <div class="record-content">
                <div class="record-title">录制中 {{timeOverInterVal}} 秒</div>
                <div class="record-msg">{{ holderTarget === 'cancel' ? '取消录制' : '松开确认' }}</div>
                <div class="record-cancel" data-record="cancel" :class="{cancel: holderTarget === 'cancel'}">
                    <span data-record="cancel" class="record-cancel-info">
                        <i data-record="cancel" class="iconfont icon-zuofei1"></i>取消
                    </span>
                </div>
            </div>
        </van-popup>


        <van-actionsheet v-model="pop.visible" get-container="body" :cancel-text="t('mue.common.cancel')"
                         @select="onSelect"
                         :actions="[{name: t('mue.form.soundRecord.playText'), act: 'play'}, {name: t('mue.common.delete'), act: 'delete'}]"/>
    </div>
</template>

<script>
    import {localeMixin, t} from "../../../src/locale";
    export default {
        name: "MueSoundRecord",
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
            disabled: {type: Boolean, default: false},
            readonly: {type: Boolean, default: false},
            multiple: {type: Boolean, default: false},
            local: {type: Boolean, default: false},
            limit: {type: Number, default: 5},
            holder: {type: Boolean, default: false,}
        },
        data() {
            return {
                audios: [],
                recording: false,
                dict: {},
                pop: {visible: false},
                current: -1,
                timeOutEvent: null,
                timeOverInterVal: 0, // 长按录制时间上限 100秒上限
                isHolder: false,
                holderTarget: '',
                zIndex: 999999
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
                //浪潮测试，需接口真实地址
                // let audioPath = 'http://192.168.100.179:8089' + this.dict[this.audios[this.current]].url;
                // console.log("audioPath", audioPath)
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
                    title: t('mue.common.delete'), message: t('mue.form.common.delPrompt')
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
                return this.$comm.getUploadPath(whole);
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
                let id = this.$comm.newFilePath('wav');
                this.$native.sound({
                        params: {id: id, local: this.local},
                        cb: ({code}) => {
                            if (code === 0) {
                                this.audios.push(id);
                            } else if (code === 1) {
                            } else {
                                this.$toast.fail(t('mue.form.soundRecord.errorText'));
                            }
                            this.recording = false;
                        }
                    },
                );
            },
            recordAudioStart(){
                if(!this.holder) return
                this.holderTarget = ''
                this.timeOutEvent = setTimeout(() => {
                    this.isHolder = true
                    this.recordAudioHolder()
                }, 500);
                return false;
            },
            recordAudioMove(e){
                if(!this.holder) return
                const target = document.elementFromPoint(e.touches[0].pageX, e.touches[0].pageY)
                if(target && target.dataset && target.dataset.record && target.dataset.record === 'cancel'){
                    this.holderTarget = 'cancel'
                }else{
                    this.holderTarget = ''
                }
                clearTimeout(this.timeOutEvent);
                this.timeOutEvent = 0;
            },
            recordAudioEnd(){
                if(!this.holder) return
                this.isHolder = false
                clearTimeout(this.timeOutEvent);
                if(!this.timeOverInterVal) return
                window.mue_record_time_interval && clearInterval(window.mue_record_time_interval)
                setTimeout(()=>{
                    this.timeOverInterVal = 0
                },300)
                if (this.timeOutEvent !== 0) {
                    if(!this.disabled && !this.holder) {
                        this.recordAudio()
                    }
                }else{
                    if(this.holderTarget === 'cancel'){
                        console.log('取消录制')
                        // todo 取消录制
                    }else{
                        console.log('完成录制')
                        // todo 完成录制
                    }
                }
                return false;
            },
            recordAudioHolder(){
                // todo 开始录制
                {
                    this.timeOutEvent = 0;
                    //执行长按要执行的内容，如弹出菜单
                    console.log("长按");
                    window.mue_record_time_interval && clearInterval(window.mue_record_time_interval)
                    window.mue_record_time_interval = setInterval(()=>{
                        this.timeOverInterVal++
                        if(this.timeOverInterVal >= 100){
                            this.recordAudioEnd()
                        }
                    },1000)
                }
            }
        }
    }
</script>
<style lang="less" scoped>
.record-btn{
    -webkit-touch-callout: none !important;
    -webkit-user-select: none;
}
.record-popup{
    background: transparent;
    .record-content{
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        .record-title{
            color: #4c4c4c;
            font-size: 14px;
            background: #07c160;
            border-radius: 6px;
            box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.42);
            width: 154px;
            height: 44px;
            transform: translateY(-40px);
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            &:after{
                content: '';
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 6px solid #07c160;
                position: absolute;
                transform: translateY(24px);
            }
        }
        .record-msg{
            position: absolute;
            bottom: 106px;
            color: #eeeeee;
        }
        .record-cancel{
            position: absolute;
            border-radius: 80px;
            width:56px;
            height: 56px;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            border: 2px solid #f3b4b2;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 12px;
            .record-cancel-info{
                background: #ed6d69;
                width: 46px;
                height: 46px;
                border-radius: 100%;
                color: #fbfbfb;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            &.cancel {
                border-color: #ed6d69;
                background: #ed6d69;
                font-size: 14px;
            }
        }
    }
}

</style>
