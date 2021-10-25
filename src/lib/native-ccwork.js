/*
* 浪潮方法代替原生方法
*/
import axios from "axios";
import {getAppId, getCid, GetQueryString, isIos, isAndroid, getHost, isCCWork} from "./common";
import uuid from "../utils/uuid";
import {urlToBase64, videoToBase64} from "../utils/image-utils";
import ccworkBridge from 'ccwork-jsbridge';
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

//ccwork主动发起
if(isCCWork()) {
    ccworkBridge.init((res) => {
        //添加应用进入监听（切换至当前应用或亮屏）
        ccworkBridge.addAppEnterForegroundListener(() => {
            window.response({
                msgid: "", method: "screenon", params: {}
            });
        });
        //添加应用进入后台监听（切换至其他应用或锁屏）
        ccworkBridge.addAppEnterBackgroundListener(() => {
            window.response({
                msgid: "", method: "screenoff", params: {}
            });
        });
        //蓝牙状态监听
        if(isIos()) {
            ccworkBridge.ccworkScanBluetooth((data) => {
                //ios需要先进行蓝牙扫描
                ccworkBridge.ccworkBluetoothUpdateState(true, (res) => {
                    window.response({
                        msgid: "", method: "onBtState", params: {
                            state: !!res.data.state ? 0 : 1
                        }
                    });
                },(res) => {
                })
            })
        } else {
            ccworkBridge.ccworkBluetoothUpdateState(true, (res) => {
                window.response({
                    msgid: "", method: "onBtState", params: {
                        state: !!res.data.state ? 0 : 1
                    }
                });
            },(res) => {
            })
        }
    });
}

//ccwork方法
const ccworkApi = {
    //保存数据到native
    save: ({msgid, method, params}) => {
        ccworkBridge.putItem(params.key, params.value, () => {
            window.response({
                msgid, method, params: {
                    state: 0
                }
            });
        });
    },
    //查询native中的数据
    query: ({msgid, method, params}) => {
        ccworkBridge.getItem(params.key, ({data}) => {
            window.response({
                msgid, method, params: {
                    value: data.value
                }
            });
        })
    },
    //删除native中的数据
    delete: ({msgid, method, params}) => {
        ccworkBridge.delItem(params.key, () => {
            window.response({
                msgid, method, params: {
                    state: 0
                }
            });
        })
    },
    //获取定位
    getLocation: ({msgid, method, params}) => {
        ccworkBridge.ccworkGetLocation(({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {
                    lat: result.lat, lng: result.lng, addr: result.addr
                }
            });
        })
    },
    //获取用户相关信息(是否需要用到云上协同的用户信息？)
    userInfo: ({msgid, method, params}) => {
        ccworkBridge.ccworkGetUserInfo(({status, errormessage, result}) => {
            if(!status) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            /*let target = {
                "_id": result.userId,
                "account": result.mobile,
                "avatar": result.avatar,
                "email": result.email,
                "mobile": result.mobile,
                "name": result.name,
                "sn": result.mobile,
                "state": 0,
                group: result.subdepartmentId || result.departmentId,
                group_code: result.userCorpOrganId,
                "group_data": {
                    _id: result.subdepartmentId || result.departmentId,
                    name: result.subdepartment || result.department,
                    code: result.userCorpOrganId,
                }
            }*/
            post(`/app/v1.0/userinfo.json`, {}).then(res => {
                window.response({
                    msgid, method, params: {
                        userInfo: isIos() ? res : JSON.stringify(res), set: {}
                    }
                });
            })


        })
    },
    //文件/图片批量选择
    multi_file: ({msgid, method, params}) => {
        ccworkBridge.ccworkGetPicsFromAlbumV2({
            maxNum: params.maxNum,
            mType: params.mType,
            piciterable: (res) => {
                let fileType = res.file.type.toLowerCase().endsWith("png") ? "image/png" : "image/jpeg";
                window.response({
                    msgid, method, params: {
                        value: {
                            content: `data:${fileType};base64,` + res.content,
                            file: {name: `${res.file.name}.jpg`, type: fileType}
                        }
                    }
                });
            }
        },({result}) => {
            //最后一次回调value:null ，代表图片数据发送结束
            window.response({
                msgid, method, params: {
                    value: null
                }
            });
        })
    },
    //删除文件
    delFile: ({msgid, method, params}) => {
        ccworkBridge.ccworkFileDelete({
            fileName: params.path
        },({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {}
            });
        })
    },
    //批量下载文件
    download: async ({msgid, method, params}) => {
        let singleDownload = (file) => {
            return new Promise((resolve, reject) => {
                ccworkBridge.ccworkFileDownload({
                    url: file.url,
                    savename: file.name
                },({status, errormessage, result}) => {
                    if(status != 1) {
                        reject(errormessage)
                    }
                    resolve({
                        url: file.url,
                        name: file.name,
                    })
                })
            })
        }

        let success = [];
        for(let i=0; i<(params.downloads || []).length; i++) {
            let file = params.downloads[i];
            //逐个下载
            let resItem = await singleDownload(file);
            success.push(resItem);
        }
        window.response({
            msgid, method, params: {
                code: 0,
                success //已成功下载对象
            }
        });
    },
    //单个下载文件
    singleDownload: ({msgid, method, params}) => {
        ccworkBridge.ccworkFileDownload({
            url: params.url,
            savename: params.name,
            onprogress: (progress) => {
                window.response({
                    msgid: "", method: "onSingleDownload", params: {
                        code: 0,
                        current: progress,
                        total: 100,
                        success: {}
                    }
                });
            }
        },({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {
                    code: 0
                }
            });
        })
    },
    //文件解压
    unzip: ({msgid, method, params}) => {
        ccworkBridge.ccworkUnarchive({
            originPath: params.name
        },({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {
                    code: 0
                }
            });
        })
    },
    //文件上传
    uploadFiles: ({msgid, method, params}) => {
        ccworkBridge.ccworkFileUpload({
            api: uploadApi,
            headers: getHeaders(),
            value: params.datas.map(m => m.path + m.name),
        },(data) => {
            let res = data.result;
            if(res.Code === 0) {
                window.response({
                    msgid, method, params: {
                        code: 0,
                        url: res.Response.url
                    }
                });
            } else {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: res.Message
                    }
                });
            }
        })
    },
    //视频录制
    video: ({msgid, method, params}) => {
        let id = uuid(32);
        ccworkBridge.ccworkTakeShortVideo({
            time: 60,
            quality: 1,
            id
        }, async ({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            const uploadVideo = (url) => {
                return new Promise((resolve, reject) => {
                    ccworkBridge.ccworkFileUpload({
                        // api: 'http://192.168.100.179:8089/app/v1.0/upload.json',
                        api: uploadApi,
                        headers: getHeaders(),
                        value: [url],
                        params: {id: params.id}
                    }, (data) => {
                        let res = data.result.url ? JSON.parse(data.result.url) : data.result;
                        if(res.Code === 0) {
                            resolve(res.Response.url);
                        } else {
                            reject(res.Message)
                        }
                    })
                });
            }
    
            //上传并获取视频地址
            let videoUrl = await uploadVideo(result.value);
            // console.log("videoUrl", videoUrl);
            window.response({
                msgid, method, params: {
                    code: 0,
                    ccUrl: videoUrl
                }
            });
            
            
            /*//获取第一帧缩略图
            // let thumb = await videoToBase64(getHost() + videoUrl);
            let thumb = await videoToBase64('http://192.168.100.179:8089' + videoUrl);
            console.log("缩略图", thumb);
            //上传并获取缩略图地址
            let uploadThumb = new Promise((resolve, reject) => {
                ccworkBridge.ccworkFileUpload({
                    // api: 'http://192.168.100.179:8089/app/v1.0/upload.json',
                    api: uploadApi,
                    headers: getHeaders(),
                    value: [result.thumb],
                }, (data) => {
                    console.log("缩略图地址", data)
                    let res = data.result;
                    if(res.Code === 0) {
                        resolve(res.Response.url);
                    } else {
                        reject(res.Message)
                    }
                })
            });

            Promise.all([uploadVideo, uploadThumb]).then(([videoUrl, thumb]) => {
                window.response({
                    msgid, method, params: {
                        code: 0,
                        ccUrl: videoUrl,
                        ccThumb: thumb
                    }
                });
            })*/

        })
    },
    //视频播放
    showVideo: ({msgid, method, params}) => {
        // let path = 'http://192.168.100.179:8089' + params.path;
        let path = params.path;
        ccworkBridge.ccworkPlayShortVideo({
            path
        }, ({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {}
            });
        })
    },
    //音频录制
    sound: ({msgid, method, params}) => {
        ccworkBridge.ccworkRecordingAudio({
            local: true,
            id: ""
        }, ({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            //测试浪潮，需传真实接口地址，代理无效
            ccworkBridge.ccworkFileUpload({
                // api: 'http://192.168.100.179:8089/app/v1.0/upload.json',
                api: uploadApi,
                headers: getHeaders(),
                value: [result.localPath],
                params: {id: params.id}
            }, (data) => {
                //和达upload接口安卓ios返回数据存在差异
                let res = data.result.url ? JSON.parse(data.result.url) : data.result;
                if(!res) {
                    window.response({
                        msgid, method, params: {
                            code: 1,
                            msg: '接口错误'
                        }
                    });
                    return
                }
                if(res.Code === 0) {
                    window.response({
                        msgid, method, params: {
                            code: 0
                        }
                    });
                } else {
                    window.response({
                        msgid, method, params: {
                            code: 1,
                            msg: res.Message
                        }
                    });
                }
            })
        })
    },
    //音频播放
    soundPlay: ({msgid, method, params}) => {
        //云上协同安卓未实现播放在线视频，此处用h5实现简易播放
        if(isAndroid() && params.path.startsWith("http")) {
            let mp3 = new Audio(params.path);
            mp3.play();
            window.response({
                msgid, method, params: {
                    value: "stop"
                }
            });
            return
        }
        ccworkBridge.ccworkPlayAudio({
            path: params.path,
            absolute: true,
            value: "start",
            hiddenView: !!params.hiddenView,
            loopPlay: !!params.hiddenView,
        }, ({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {
                    value: result.value
                }
            });
        })
    },
    //噪声巡检报警振动
    vibratorSound: ({msgid, method, params}) => {
        ccworkBridge.ccworkVibratorSound(!params.value, ({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
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
            ccworkBridge.hideTitleBar()
        } else {
            let title = document.title;
            ccworkBridge.setTitle(title)
        }
        window.response({
            msgid, method, params: {}
        });
    },
    //资源保存
    resSave: async ({msgid, method, params}) => {
        let val = "";
        if(params.type === "img_base64") {
            val = params.value
        } else {
            val = await urlToBase64(params.value);
        }
        let prefix = val.match(/^data:image\/[a-z]+;base64,/)[0];
        val = val.substring(prefix.length);

        ccworkBridge.savePhotoToGallery({
            imgdata: val
        })
        //savePhotoToGallery没有回调函数，当前只能默认返回成功
        window.response({
            msgid, method, params: {code: 0}
        });
    },
    //分享内容
    share: ({msgid, method, params}) => {
        ccworkBridge.ccworkShareInfo({
            title: params.title,
            subtitle: params.text,
            img: params.imgUrl,
            url: params.url,
        },({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {}
            });
        })
    },
    //调用系统分享文件
    shareFile: ({msgid, method, params}) => {
        ccworkBridge.shareFile("", "", params.path, () => {
            window.response({
                msgid, method, params: {
                    state: 0
                }
            });
        })
    },
    //获取应用信息
    sysInfo: ({msgid, method, params}) => {
        ccworkBridge.ccworkGetDeviceInfo(({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {
                    "account": "张超",
                    "brand": "HUAWEI",
                    "h5_version": "/upload/h5version/139/1.0.139/5bf387ffde88e92549d59ecd.zip",
                    "ip": "http://app.dlmeasure.com",
                    "model": "HUAWEI VNS-AL00",
                    "os": "6.0",
                    "push_reg_id": "0863293038255797300002353500CN01",
                    "resolution": "1080*1812",
                    "sn": "0023",
                    "sys_name": "SCADA7基板185:7202",
                    "version": "1.0.1811210947",
                    "support_apple_sign_in": false // 是否支持苹果登录
                }
            });
        })
    },
    //客户端扫码功能
    scanCode: ({msgid, method, params}) => {
        ccworkBridge.openScan({
            type: "callback",
        },({type, reqid, data}) => {
            window.response({
                msgid, method, params: {
                    code: data.result
                }
            });
        })
    },
    //调用原生返回事件
    goback: ({msgid, method, params}) => {
        ccworkBridge.closeWebView();
        window.response({
            msgid, method, params: {}
        });
    },
    //拦截app返回
    interceptBack: ({msgid, method, params}) => {
        ccworkBridge.ccworkInterceptOriginGoback(params.value, () => {}, ({status, errormessage, result}) => {
            if (status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {}
            });
        })
    },
    //数据库执行操作(SQLite)
    sqlite_execsql: ({msgid, method, params}) => {
        let sql = "", tempArr = [], args = params.args || [];
        let sqlArr = params.sql.split("?");
        args.forEach((f, i) => {
            tempArr.push(sqlArr[i] + f);
        })
        sql = tempArr.join("")
        ccworkBridge.ccworkExecuteSQL({
            sql,
            dbname: params.name,
        },({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {
                    code: 0,
                    msg: errormessage
                }
            });
        })
    },
    //数据库查询(SQLite)
    sqlite_query: ({msgid, method, params}) => {
        let sql = "", tempArr = [], args = params.args || [];
        let sqlArr = params.sql.split("?");
        args.forEach((f, i) => {
            tempArr.push(sqlArr[i] + f);
        })
        sql = tempArr.join("")
        ccworkBridge.ccworkExecuteSQL({
            sql,
            dbname: params.name,
        },({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {
                    code: 0,
                    msg: errormessage
                }
            });
        })
    },
    //日志文件保存
    logger: ({msgid, method, params}) => {
        ccworkBridge.ccworkFileWrite({
            filename: params.name,
            log: params.log,
            append: params.overwrite !== 1,
        },({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {
                    code: 0,
                    msg: ""
                }
            });
        })
    },
    //清除webview缓存
    clearCache: ({msgid, method, params}) => {
        ccworkBridge.ccworkClearWebCache([],({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {
                    code: 0
                }
            });
        })
    },
    //横竖屏切换
    rotate: ({msgid, method, params}) => {
        ccworkBridge.ccworkChangeUIInterfaceOrientation(!rotateflag, () => {
            //测试发现，ios没有进回调，所以逻辑写在外侧
        })
        window.response({
            msgid, method, params: {}
        });
        if(!rotateflag) {
            ccworkBridge.hideTitleBar()
        } else {
            let title = document.title;
            ccworkBridge.setTitle(title)
        }
        rotateflag = !rotateflag;
    },
    //经纬度转详细地址
    regeocode: ({msgid, method, params}) => {
        ccworkBridge.ccworkLocationRegeo({
            lat: String(params.lat),
            lng: String(params.lng),
        },({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {
                    code: 0,
                    addr: result.addr
                }
            });
        })
    },
    //地图导航(百度地图，高德地图，腾讯地图)
    startNavi: ({msgid, method, params}) => {
        let mode;
        switch (params.naviType) {
            case 'drive':
                mode = 0;
                break;
            case 'transit':
                mode = 1;
                break;
            case 'walk':
                mode = 2;
                break;
            case 'cycling':
                mode = 3;
                break;
            default:
                mode = 2;
        }
        ccworkBridge.ccworkInvokeNavi({
            srclng: String(params.startLng),
            srclat: String(params.startLat),
            dstlng: String(params.lng),
            dstlat: String(params.lat),
            mode
        },({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {}
            });
        })
    },
    //H5开启/关闭巡检定位
    trace: ({msgid, method, params}) => {
        ccworkBridge.ccworkLocationTracking({
            action: !!params.state,
            uri: params.uri
        },({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {
                    state: 0,
                }
            });
        })
    },
    //截屏分享
    screenshot: ({msgid, method, params}) => {
        ccworkBridge.ccworkGetScreenShot(params.isShare, ({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {
                    code: 0
                }
            });
        })
    },
    //nfcData
    nfcData: ({msgid, method, params}) => {
        ccworkBridge.ccworkGetNFCData(({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {
                    code: 0,
                    result: result
                }
            });
        })
    },
    //水印相机
    watermarkCamera: ({msgid, method, params}) => {
        ccworkBridge.ccworkGetPicsFromCameraAndAlbum({
            mark: params.content
        },({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        code: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {
                    code: 0,
                    base64Img: "data:image/jpeg;base64," + result
                }
            });
        })
    },
    //开启蓝牙
    openBluetooth: ({msgid, method, params}) => {
        ccworkBridge.ccworkOpenBluetooth(({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        state: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {
                    state: 0
                }
            });
        })
    },
    //蓝牙操作
    bluetooth: ({msgid, method, params}) => {
        if(params.key === "scan") {
            ccworkBridge.ccworkScanBluetooth(({status, errormessage, result}) => {
                if(status != 1) {
                    window.response({
                        msgid, method, params: {
                            code: 1,
                            msg: errormessage
                        }
                    });
                    return
                }
                window.response({
                    msgid, method, params: {
                        code: 0,
                        result
                    }
                });
            })
        } else if(params.key === "cancelScan") {
            ccworkBridge.ccworkCancelScanBluetooth(({status, errormessage, result}) => {
                if(status != 1) {
                    window.response({
                        msgid, method, params: {
                            code: 1,
                            msg: errormessage
                        }
                    });
                    return
                }
                window.response({
                    msgid, method, params: {
                        code: 0,
                        result
                    }
                });
            })
        } else if(params.key === "connect") {

        } else if(params.key === "getConnected") {

        } else if(params.key === "disConnected") {

        } else if(params.key === "inspect") {

        } else if(params.key === "history") {

        } else if(params.key === "rgud") {

        } else if(params.key === "getTestParams") {

        } else if(params.key === "setTestParams") {

        } else if(params.key === "handCollect") {

        } else if(params.key === "getOriginalData") {

        } else if(params.key === "resume") {

        }
    },
    //获取蓝牙状态
    bluetoothState: ({msgid, method, params}) => {
        ccworkBridge.ccworkGetBluetoothState(({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        state: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {
                    state: 0
                }
            });
        })
    },
    //保存数据-通用数据库
    saveLocalData: ({msgid, method, params}) => {
        ccworkBridge.ccworkExecuteSQL({
            sql: "",
            dbname: params.type
        }, ({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        state: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {
                    state: 0,
                    msg: ""
                }
            });
        })
    },
    //查询数据-通用数据库
    queryLocalData: ({msgid, method, params}) => {
        ccworkBridge.ccworkExecuteSQL({
            sql: ""
        }, ({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        state: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {
                    "total": 100,     // 总条数
                    "datas": [{
                        "myId": "",   // 数据库主键
                        "uid": "",    // 用户id
                        "state": "",  // 状态，0:初始；1:待上传；2:已上传
                        "created": 0, // 插入时间
                        "updated": 0, // 更新时间
                        "type": "",  // 业务类型
                        "_id": "",    // 业务主键
                            "c1": "",     // 列名1
                            "c2": "",     // 列名2
                            "c3": "",     // 列名3
                            "c4": "",     // 列名4
                            "c5": "",     // 列名5
                            "c6": "",     // 列名6
                            "data": ""    // JSON对象字符串
                    }] //集合对象
                }
            });
        })
    },
    //删除数据-通用数据库
    deleteLocalData: ({msgid, method, params}) => {
        //还需加mobile
        let mobile = "";
        let datas = params.datas;
        let type = ""
        let res = `mobile = ${mobile} and `
        for(let item of datas) {
            if(item.key === "type") {
                type = item.key
            }
            if(item.isEqual) {
                res += `${item.key} = ${item.value} and `
            } else {
                res += `${item.key} like % ${item.value} % and `
            }
        }
        res = res.substr(-4);

        ccworkBridge.ccworkExecuteSQL({
            sql: `delete from ${type} where ${res}`,
        }, ({status, errormessage, result}) => {
            if(status != 1) {
                window.response({
                    msgid, method, params: {
                        state: 1,
                        msg: errormessage
                    }
                });
                return
            }
            window.response({
                msgid, method, params: {
                    state: 0,
                    msg: ""
                }
            });
        })
    },
}

export default ccworkApi;
