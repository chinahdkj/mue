/*
* 浙政钉方法代替原生方法
*/
import axios from "axios";
import {getAppId, getCid, GetQueryString, isIos, isAndroid, getHost, isCCWork, isDingGov} from "./common";
import uuid from "../utils/uuid";
import {urlToBase64, videoToBase64} from "../utils/image-utils";
import ddgov from "gdt-jsapi";
import Vue from "vue";
const isWebApi = process.env.VUE_APP_INTERFACE === 'web'?true:false

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

let post = (url, data, failed = false, appid = null, header = null) => {
    let setting = {
        method: "post",
        baseURL: process.env.NODE_ENV === "production" ? getHost() : "/list",
        url,
        data: data,
        timeout: 30000
    }
    if(isWebApi){
        setting.url = getUrl(url)
    }else{
        setting['headers'] = header || getHeaders(appid)
    }
    return axios(setting).then(res => res.Response).catch(e => {
        console.log(e);
        // 请求接口不存在 或者 APP服务返回第三方接口解析错误（大部分原因是scada系统中不存在接口）
        // 之后做了版本控制之后，需要放掉这段代码，将错误暴露到前台
        if((e.response && e.response.status === 404) || (e.Code === 21001 || e.code === 21001) || e.response == undefined){
            // TODO
        }
        else if(e.Message){
            !failed && Vue.prototype.$toast && Vue.prototype.$toast(e.Message);
        }
        else{
            !failed && Vue.prototype.$toast && Vue.prototype.$toast("请求出错，请稍候再试!");
        }

        return Promise.reject(e);
    });
}

const jsApiAuth = (arr = []) =>{
    return new Promise((resolve,reject)=>{
        post('/hd/app/dingtalkgov/v1.0/user/getTicket.json', {},{
            processData: false, 
            contentType: false
        }).then(res => {
            const ticket = res && res.ticket
            ddgov.authConfig({
                ticket:ticket,
                jsApiList:["getGeolocation","showOnMap",...arr]
            }).then((e)=>{
                resolve()
            }).catch(err=>{
                reject(err)
            })
        }).catch(err=>{
            reject(err)
        })
    })
}

// 浙政钉主动监听
if(isDingGov()){
    ddgov.ready(()=>{
        //添加应用进入监听（切换至当前应用或亮屏）
        // ccworkBridge.addAppEnterForegroundListener(() => {
        //     window.response({
        //         msgid: "", method: "screenon", params: {}
        //     });
        // });
        //添加应用进入后台监听（切换至其他应用或锁屏）
        // ccworkBridge.addAppEnterBackgroundListener(() => {
        //     window.response({
        //         msgid: "", method: "screenoff", params: {}
        //     });
        // });
        //蓝牙状态监听
        if(isIos()) {
            // ccworkBridge.ccworkScanBluetooth((data) => {
            //     //ios需要先进行蓝牙扫描
            //     ccworkBridge.ccworkBluetoothUpdateState(true, (res) => {
            //         window.response({
            //             msgid: "", method: "onBtState", params: {
            //                 state: !!res.data.state ? 0 : 1
            //             }
            //         });
            //     },(res) => {
            //     })
            // })
        } else {
            // ccworkBridge.ccworkBluetoothUpdateState(true, (res) => {
            //     window.response({
            //         msgid: "", method: "onBtState", params: {
            //             state: !!res.data.state ? 0 : 1
            //         }
            //     });
            // },(res) => {
            // })
        }
    })
}

// 浙政钉方法
const dinggovApi = {
    //保存数据到native
    save: ({msgid, method, params}) => {
        ddgov.setStorageItem({
            name:params.key, 
            value:params.value
        }).then(res => {
            window.response({
                msgid, method, params: {
                    state: 0
                }
            });
        }).catch(err => {

        })
    },
    //查询native中的数据
    query: ({msgid, method, params}) => {
        ddgov.getStorageItem({
            name:params.key
        }).then(res => {
            window.response({
                msgid, method, params: {
                    value: res.value
                }
            });
        }).catch(err => {

        })
    },
    //删除native中的数据
    delete: ({msgid, method, params}) => {
        ddgov.removeStorageItem({
            name:params.key
        }).then(res => {
            window.response({
                msgid, method, params: {
                    state: 0
                }
            });
        }).catch(err =>{

        })
    },
    //获取定位 ？需要js鉴权
    getLocation: ({msgid, method, params}) => {
        jsApiAuth().then(()=>{
            ddgov.getGeolocation({
                useCache:true,
                coordinate:1,
                withReGeocode:true,
            }).then(result=>{
                window.response({
                    msgid, method, params: {
                        lat: result.latitude, lng: result.longitude, addr: result.address
                    }
                });
            }).catch(err=>{
                window.response({
                    msgid, method, params: {
                        lat: 0, lng: 0, addr:''
                    }
                });
            })
        }).catch(()=>{
            window.response({
                msgid, method, params: {
                    lat: 0, lng: 0, addr:''
                }
            });
        })
    },
    //获取用户相关信息(是否需要用到浙政钉的用户信息？)
    userInfo: ({msgid, method, params}) => {
        ddgov.getLoginUser().then(res =>{
            window.response({
                msgid, method, params: {
                    userInfo: res
                }
            });
            return
            // 是否要接口返回？
            // post(`/app/v1.0/userinfo.json`, {}).then(res => {
            //     window.response({
            //         msgid, method, params: {
            //             userInfo: isIos() ? res : JSON.stringify(res), set: {}
            //         }
            //     });
            // })
        }).catch(errormessage => {
            window.response({
                msgid, method, params: {
                    code: 1,
                    msg: errormessage
                }
            });
        })
    },
    //文件/图片批量选择
    multi_file: ({msgid, method, params}) => {
        ddgov.chooseFile({
            maxNum: params.maxNum,
            multiSelection: true,
        }).then(res=>{
            window.response({
                msgid, method, params: {
                    value: res.files
                }
            });            
        })
    },
    //删除文件
    delFile: ({msgid, method, params}) => {
        
    },
    // 文件下载
    download: ({msgid, method, params}) => {
        
    },
    // 单个文件下载
    singleDownload: ({msgid, method, params}) => {
        
    },
    // 文件解压
    unzip: ({msgid, method, params}) => {
        
    },
    // 文件上传
    uploadFiles: ({msgid, method, params}) => {
        // ddgov.uploadFile({
        //     filePath:params.files
        // })
    },
    // 视频录制
    video: ({msgid, method, params}) => {
        ddgov.shootVideo().then(res=>{
            window.response({
                msgid, method, params: {
                    value: res.path
                }
            });  
        })
    },
    // 视频播放
    showVideo: ({msgid, method, params}) => {
        
    },
    //音频录制
    sound: ({msgid, method, params}) => {
        // 开始录音
        ddgov.startRecordAudio().then(res=>{
            console.log(res)
        })
        // 停止录音
        ddgov.stopRecordAudio().then(res=>{
            console.log(res)
        })
        // 
    },
    //音频播放
    soundPlay: ({msgid, method, params}) => {
        //浙政钉未实现播放在线视频，此处用h5实现简易播放
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
        ddgov.vibrate().then(res=>{
            window.response({
                msgid, method, params: {
                    code: 0
                }
            });
        })
    },
    //摄像抄表
    ocr_watermeter: ({msgid, method, params}) => {
    },
    //手机签字
    signature: ({msgid, method, params}) => {
    },
    //隐藏&显示顶部标题栏
    hideHeader: ({msgid, method, params}) => {
        if(params.hide === 1) {
            ddgov.hideTitleBar()
        } else {
            ddgov.showTitleBar()
        }
        window.response({
            msgid, method, params: {}
        });
    },
    //资源保存 浙政钉没有保存到本地功能
    resSave: async ({msgid, method, params}) => {

    },
    //分享内容
    share: ({msgid, method, params}) => {
        ddgov.shareToMessage({
            url: params.url,
            title: params.title,
            content: params.text,
            image: params.imgUrl,
        }).then(res=>{
            console.log(res)
            window.response({
                msgid, method, params: {}
            });
        }).catch(err=>{
            window.response({
                msgid, method, params: {
                    code: 1,
                    msg: err
                }
            });
        })
    },
    //调用系统分享文件
    shareFile: ({msgid, method, params}) => {
        ddgov.shareFileToMessage({
            fileName:params.name || params.fileName,
            fileUrl:params.path
        }).then(res=>{
            window.response({
                msgid, method, params: {
                    state: 0
                }
            });
        }).catch(err=>{
            window.response({
                msgid, method, params: {
                    code: 1,
                    msg: err
                }
            });            
        })
    },
    //获取应用信息
    sysInfo: ({msgid, method, params}) => {
        ddgov.getPhoneInfo().then(res=>{
            window.response({
                msgid, method, params: res
            });            
        }).catch(err=>{
            window.response({
                msgid, method, params: {
                    code: 1,
                    msg: err
                }
            });
        })
    },    
    // 扫码
    scanCode: ({msgid, method, params}) => {
        ddgov.scan({
            // type: "qr",
        }).then(res=>{
            window.response({
                msgid, method, params: {
                    code: res.text
                }
            });
        })
    },
    //调用原生返回事件
    goback: ({msgid, method, params}) => {
        ddgov.goBack().then(res=>{
            window.response({
                msgid, method, params: {}
            });    
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
            ddgov.hideTitleBar()
            ddgov.rotateView().then(res=>{
                window.response({
                    msgid, method, params: {}
                });
                rotateflag = !rotateflag;
            }).catch(err=>{

            })
        }else{
            ddgov.showTitleBar()
            ddgov.resetView().then(res=>{
                window.response({
                    msgid, method, params: {}
                });
                rotateflag = !rotateflag;
            }).catch(err=>{

            })
        }
    },
    //经纬度转详细地址
    regeocode: ({msgid, method, params}) => {
        
    },
    //地图导航(百度地图，高德地图，腾讯地图)
    startNavi: ({msgid, method, params}) => {
        jsApiAuth().then(()=>{
            ddgov.showOnMap({
                latitude:params.lat,
                longitude:params.lng,
                title:params.addr
            }).then(res=>{
                window.response({
                    msgid, method, params: {
                        state: 0
                    }
                });                
            }).catch(r=>{
                window.response({
                    msgid, method, params: {code: 1,msg: r}
                }); 
            })
        }).catch((err)=>{
            window.response({
                msgid, method, params: {code: 1,msg: err}
            }); 
        })
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
        ddgov.openWatermarkCamera().then(res=>{
            ddgov.readImageToBase64({
                filePath:res.path
            }).then((result)=>{
                window.response({
                    msgid, method, params: {
                        code: 0,
                        base64Img: "data:image/jpeg;base64," + result.base64
                    }
                });  
            }).catch((err)=>{
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: err
                    }
                }); 
            })
        }).catch(err=>{
            window.response({
                msgid, method, params: {
                    code: 1,
                    msg: err
                }
            });          
        })
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


export default dinggovApi;