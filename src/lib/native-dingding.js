/*
* 钉钉方法代替原生方法
*/
import {getAppId, getCid, GetQueryString, isIos, isAndroid, getHost, isDingDing} from "./common";
import * as dd from "dingtalk-jsapi";
import http from './http'
import Vue from "vue";

const isWebApi = process.env.VUE_APP_INTERFACE === 'web'

//横竖屏切换状态，默认false 竖屏
let rotateflag = false;

//上传接口
let uploadApi = `${getHost()}/app/v1.0/upload.json`;
let userInfoApi = `/app/v1.0/userinfo.json`;

//获取header
const HEADER_SETTING1 = {
    ignore: {},
    rewrite: {}
};

const getHeaders = (appid = null) => {
    let _token = GetQueryString("token");
    if(_token){
        sessionStorage.setItem("authortoken", _token);
    }
    else{
        _token = sessionStorage.getItem("authortoken") || "";
    }

    let headers = {
        Authorization: _token,
        Token: _token,
        APP: getCid(),
        appid: appid === "" ? "" : (appid || getAppId())
    };

    Object.entries(HEADER_SETTING1.rewrite).forEach(([k, v]) => {
        headers[k] = v;
    });

    Object.entries(HEADER_SETTING1.ignore).forEach(([k, v]) => {
        v && delete headers[k];
    });

    return headers;
};

//针对S7
function getUrl (url){
    let prefix = "/app/customer"
    if(url.startsWith(prefix)){
        return url.substring(prefix.length)
    }else{
        return url;
    }
}


const dingdingLogin = (info) => {
    // 通过钉钉code 获得
    http.post('/hd/app/dingding/v1.0/user/login.json', info, false, null, {}).then((result) => {
        sessionStorage.setItem("dingdingCode", info.code);
        sessionStorage.setItem("authortoken", result.access_token);
        sessionStorage.setItem("authorapp", result.app);
    }).catch(() => {

    });
}

// 钉钉鉴权
const jsApiAuth = (arr = []) =>{
    return new Promise((resolve,reject)=>{
        http.post('/app/v1.0/dingding/config.json', {}, true, "").then(res => {
            dd.config({
                agentId: res.agentId, // 必填，微应用ID
                corpId: res.corpId,//必填，企业ID
                timeStamp: res.timeStamp, // 必填，生成签名的时间戳
                nonceStr: res.nonceStr, // 必填，自定义固定字符串。
                signature: res.signature, // 必填，签名
                jsApiList : [
                    'runtime.info',
                    'biz.contact.complexPicker',
                    'biz.contact.departmentsPicker',
                    'biz.clipboardData.setData',
                    'biz.telephone.call',
                    'biz.telephone.showCallMenu',
                    'biz.cspace.saveFile',
                    'biz.util.uploadAttachment',
                    'biz.cspace.preview',
                    'biz.cspace.chooseSpaceDir',
                    'biz.util.chooseImage',
                    'device.geolocation.get',
                    'device.geolocation.start',
                    'device.geolocation.stop',
                    'biz.map.locate',
                    'biz.map.search',
                    'biz.map.view',
                    'device.audio.startRecord',
                    'device.audio.stopRecord',
                    'device.audio.onRecordEnd',
                    'device.audio.download',
                    'device.audio.play',
                    'device.audio.pause',
                    'device.audio.resume',
                    'device.audio.stop',
                    'device.audio.onPlayEnd',
                    'device.audio.translateVoice',
                ] // 必填，需要使用的jsapi列表，注意：不要带dd。
            });
            dd.error(function (err) {
                console.warn('dd error: ' + JSON.stringify(err));
            })//该方法必须带上，用来捕获鉴权出现的异常信息，否则不方便排查出现的问题
            resolve()
        }).catch(err=>{
            resolve()
        })
    })
}

if(isDingDing()){
    jsApiAuth().then(()=>{
        dd.ready(()=>{
            let corpId = this.$comm.GetQueryString("corpid");
            let self = this;
            dd.runtime.permission.requestAuthCode({
                corpId: corpId,
                onSuccess: result=> {
                    dingdingLogin(result)
                },
                onFail: err=> {
                    console.error(err);
                }
            });
        })
    })
}

// 钉钉方法
const dingdingfn = {
    //保存数据到native
    save: ({msgid, method, params}) => {
        dd.util.domainStorage.setItem({
            name:params.key,
            value:params.value,
            onSuccess : function(info) {
                window.response({
                    msgid, method, params: {
                        state: 0,
                        info
                    }
                });
            },
            onFail : function(err) {

            }
        })
    },
    //查询native中的数据
    query: ({msgid, method, params}) => {
        dd.util.domainStorage.getItem({
            name:params.key,
            onSuccess : function(info) {
                window.response({
                    msgid, method, params: {
                        value: info
                    }
                });
            },
            onFail : function(err) {

            }
        })
    },
    //删除native中的数据
    delete: ({msgid, method, params}) => {
        dd.util.domainStorage.removeItem({
            name: params.key , // 存储信息的key值
            onSuccess : function(info) {
                window.response({
                    msgid, method, params: {
                        state: 0,
                        info
                    }
                });
            },
            onFail : function(err) {

            }
        });
    },
    //获取定位 ？需要js鉴权
    getLocation: ({msgid, method, params}) => {
        dd.device.geolocation.get({
            targetAccuracy : 200,
            coordinate : 1,
            withReGeocode : true,
            useCache: true, //默认是true，如果需要频繁获取地理位置，请设置false
            onSuccess : function(result) {
                console.log({result})
                window.response({
                    msgid, method, params: {
                        lat: result.latitude,
                        lng: result.longitude,
                        addr: result.address
                    }
                });
                /* 高德坐标 result 结构
                {
                    longitude : Number,
                    latitude : Number,
                    accuracy : Number,
                    address : String,
                    province : String,
                    city : String,
                    district : String,
                    road : String,
                    netType : String,
                    operatorType : String,
                    locationType：1,
                    errorMessage : String,
                    errorCode : Number,
                    isWifiEnabled : Boolean,
                    isGpsEnabled : Boolean,
                    isFromMock : Boolean,
                    provider : wifi|lbs|gps,
                    isMobileEnabled : Boolean
                }
                */
            },
            onFail : function(err) {
                window.response({
                    msgid, method, params: null
                });
            }
        });
    },
    //获取用户相关信息(是否需要用到浙政钉的用户信息？)
    userInfo: ({msgid, method, params}) => {
        post(`/app/v1.0/userinfo.json`, {}).then(res => {
            window.response({
                msgid, method, params: {
                    userInfo: isIos() ? res : JSON.stringify(res), set: {}
                }
            });
        })
    },
    //文件/图片批量选择
    multi_file: ({msgid, method, params}) => {
        //没有
    },
    //删除文件
    delFile: ({msgid, method, params}) => {
        //没有
    },
    // 文件下载
    download: ({msgid, method, params}) => {
        //钉钉原生有下载，但是逻辑不太一样
    },
    // 单个文件下载
    singleDownload: ({msgid, method, params}) => {
        //钉钉原生有下载，但是逻辑不太一样
    },
    // 文件解压
    unzip: ({msgid, method, params}) => {
        //没有该功能
    },
    // 文件上传
    uploadFiles: ({msgid, method, params}) => {
        //钉钉原生上传是上传到开发者服务器没有该功能
    },
    // 视频录制
    video: ({msgid, method, params}) => {
        //没有该功能
    },
    // 视频播放
    showVideo: ({msgid, method, params}) => {
        //没有该功能
    },
    //音频录制
    sound: ({msgid, method, params}) => {
        // 需要鉴权
    },
    //音频播放
    soundPlay: ({msgid, method, params}) => {
        //在线视频，此处用h5实现简易播放
        if(params.path.startsWith("http")) {
            let mp3 = new Audio(params.path);
            mp3.play();
            window.response({
                msgid, method, params: {
                    value: "stop"
                }
            });
            return
        }
    },
    //噪声巡检报警振动
    vibratorSound: ({msgid, method, params}) => {
        // 没有功能
    },
    //摄像抄表
    ocr_watermeter: ({msgid, method, params}) => {
        // 没有功能
    },
    //手机签字
    signature: ({msgid, method, params}) => {
        // 没有功能
    },
    //隐藏&显示顶部标题栏
    hideHeader: ({msgid, method, params}) => {
        // 钉钉不支持
        window.response({
            msgid, method, params: {}
        });
    },
    //资源保存
    resSave: async ({msgid, method, params}) => {
        // 没有功能
    },
    //分享内容
    share: ({msgid, method, params}) => {
        dd.biz.util.share({
            type: 0,//分享类型，0:全部组件 默认；1:只能分享到钉钉；2:不能分享，只有刷新按钮
            url: params.url,
            title: params.title,
            content: params.text,
            image: params.imgUrl,
            onSuccess : function() {
                window.response({
                    msgid, method, params: {}
                });
            },
            onFail : function(err) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: err
                    }
                });
            }
        })
    },
    //调用系统分享文件
    shareFile: ({msgid, method, params}) => {
        dd.biz.util.share({
            type: 0,//分享类型，0:全部组件 默认；1:只能分享到钉钉；2:不能分享，只有刷新按钮
            url: params.path,
            title: params.name || params.fileName,
            content: params.name || params.fileName,
            image: '',
            onSuccess : function() {
                window.response({
                    msgid, method, params: {
                        state: 0
                    }
                });
            },
            onFail : function(err) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: err
                    }
                });
            }
        })
    },
    //获取应用信息
    sysInfo: ({msgid, method, params}) => {
        dd.device.base.getPhoneInfo({
            onSuccess : function(res) {
                window.response({
                    msgid, method, params: res
                });
            },
            onFail : function(err) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: err
                    }
                });
            }
        });
    },
    // 扫码
    scanCode: ({msgid, method, params}) => {
        dd.biz.util.scan({
            type: 'all' , // type 为 all、qrCode、barCode，默认是all。
            onSuccess: function(data) {
                window.response({
                    msgid, method, params: {
                        code: data
                    }
                });
            },
            onFail : function(err) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: err
                    }
                });
            }
        })
    },
    //调用原生返回事件
    goback: ({msgid, method, params}) => {
        dd.biz.navigation.goBack({
            onSuccess : function(result) {
                window.response({
                    msgid, method, params: {}
                });
            },
            onFail : function(err) {}
        })
    },
    //拦截app返回
    interceptBack: ({msgid, method, params}) => {

    },
    //数据库执行操作(SQLite)
    sqlite_execsql: ({msgid, method, params}) => {

    },
    //数据库查询(SQLite)
    sqlite_query: ({msgid, method, params}) => {

    },
    //日志文件保存
    logger: ({msgid, method, params}) => {

    },
    //清除webview缓存
    clearCache: ({msgid, method, params}) => {

    },
    //横竖屏切换
    rotate: ({msgid, method, params}) => {
        if(!rotateflag){
            dd.device.screen.rotateView({
                showStatusBar : true, // 否显示statusbar
                clockwise : true, // 是否顺时针方向
                onSuccess : function(result) {
                    window.response({
                        msgid, method, params: {}
                    });
                    rotateflag = !rotateflag;
                },
                onFail : function(err) {}
            });
        }else{
            dd.device.screen.resetView({
                onSuccess : function(result) {
                    window.response({
                        msgid, method, params: {}
                    });
                    rotateflag = !rotateflag;
                },
                onFail : function(err) {}
            });
        }
    },
    //经纬度转详细地址
    regeocode: ({msgid, method, params}) => {

    },
    //地图导航(百度地图，高德地图，腾讯地图)
    startNavi: ({msgid, method, params}) => {

    },
    //H5开启/关闭巡检定位
    trace: ({msgid, method, params}) => {

    },
    //截屏分享
    screenshot: ({msgid, method, params}) => {

    },
    //nfcData
    nfcData: ({msgid, method, params}) => {

    },
    //水印相机
    watermarkCamera: ({msgid, method, params}) => {

    },
    //开启蓝牙
    openBluetooth: ({msgid, method, params}) => {

    },
    //蓝牙操作
    bluetooth: ({msgid, method, params}) => {

    },
    //获取蓝牙状态
    bluetoothState: ({msgid, method, params}) => {

    },
    //保存数据-通用数据库
    saveLocalData: ({msgid, method, params}) => {

    },
    //查询数据-通用数据库
    queryLocalData: ({msgid, method, params}) => {

    },
    //删除数据-通用数据库
    deleteLocalData: ({msgid, method, params}) => {

    },
}

export default dingdingfn;