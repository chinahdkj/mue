/*
* 浪潮方法代替原生方法
*/
import {isIos} from "./common";
import ccworkBridge from 'ccwork-jsbridge';

const errorHandle = (msg) => {
    console.error(msg);
}

const ccworkApi = {
    //保存数据到native
    save: ({msgid, method, params}) => {
        ccworkBridge.putItem(params.key, params.value, (data) => {
            window.response({
                msgid, method, params: {
                    state: 0
                }
            });
        });
    },
    //查询native中的数据
    query: ({msgid, method, params}) => {
        ccworkBridge.getItem(params.key, (data) => {

        })
    },
    //删除native中的数据
    delete: ({msgid, method, params}) => {
        ccworkBridge.delItem(params.key, (data) => {

        })
    },
    //获取定位
    getLocation: ({msgid, method, params}) => {
        ccworkBridge.ccworkGetLocation(({status, errormessage, result}) => {
            if(status != 1) {
                errorHandle(errormessage);
                return
            }
            window.response({
                msgid, method, params: {
                    lat: result.lat, lng: result.lng, addr: result.addr
                }
            });
        })
    },
    //获取用户相关信息
    userInfo: ({msgid, method, params}) => {
        ccworkBridge.ccworkGetUserInfo(({status, errormessage, result}) => {
            if(!status) {
                errorHandle(errormessage);
                return
            }
            let target = {
                "_id": result.userId,
                "account": "zander",
                "admin": 1,
                "avatar": result.avatar,
                "changed": 1542452471,
                "direct": "",
                "duty": "",
                "email": result.email,
                "group": "6f747226-ba22-4cc6-9fe7-94970b5a52a6",
                "group_code": "C057002",
                "group_data": {
                    "_id": "6f747226-ba22-4cc6-9fe7-94970b5a52a6",
                    "address": "嘉兴",
                    "changed": 1539753739,
                    "city": "嘉兴市",
                    "code": "C057002",
                    "created": 1537324874,
                    "district": "秀洲区",
                    "level": "C",
                    "name": result.company,
                    "order": 1,
                    "parent": "C057",
                    "province": "浙江省",
                    "sname": "嘉兴水务",
                    "status": 1,
                    "tenantid": 0,
                    "type": "123",
                    "zipcode": "440000000000",
                    "zone": "1001"
                },
                "idcard": "33333",
                "job": "",
                "mobile": result.mobile,
                "name": result.name,
                "pinyin": "ZHANGCHAO",
                "post": "",
                "py": "ZC",
                "scada6_token": "",
                "smobile": "",
                "sn": "hd543",
                "state": 0,
                "sysname": "",
                "telephone": ""
            }
            window.response({
                msgid, method, params: {
                    userInfo: isIos() ? target : JSON.stringify(target), set: {}
                }
            });
        })
    },
    //文件/图片批量选择
    multi_file: ({msgid, method, params}) => {
        ccworkBridge.ccworkGetPicsFromAlbum({
            maxNum: params.maxNum,
            mType: params.mType,
        },({result}) => {
            window.response({
                msgid, method, params: {
                    value: {
                        content: result[0].content,
                        file: {name: result[0].file.name, type: result[0].file.type}
                    }
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
                errorHandle(errormessage);
                return
            }
            window.response({
                msgid, method, params: {}
            });
        })
    },
    //批量下载文件
    download: ({msgid, method, params}) => {
        ccworkBridge.ccworkFileDownload({
            url: params.url,
            savename: params.name,
        },({status, errormessage, result}) => {
            if(status != 1) {
                errorHandle(errormessage);
                return
            }
            window.response({
                msgid, method, params: {
                    code: 0,
                    success: [{}]
                }
            });
        })
    },
    //单个下载文件
    singleDownload: ({msgid, method, params}) => {
        ccworkBridge.ccworkFileDownload({
            url: params.url,
            savename: params.name,
        },({status, errormessage, result}) => {
            if(status != 1) {
                errorHandle(errormessage);
                return
            }
            window.response({
                msgid, method: "onSingleDownload", params: {
                    code: 0,
                    current: 0,
                    total: 0,
                    success: {}
                }
            });
        })
    },
    //文件解压
    unzip: ({msgid, method, params}) => {
        ccworkBridge.ccworkUnarchive({
            originPath: params.path
        },({status, errormessage, result}) => {
            if(status != 1) {
                errorHandle(errormessage);
                return
            }
            window.response({
                msgid, method, params: {
                    code: 0
                }
            });
        })
    },
    //视频录制
    video: ({msgid, method, params}) => {
        ccworkBridge.ccworkTakeShortVideo({
            time: 60,
            quality: 1,
            id: params.id
        }, ({result}) => {
            window.response({
                msgid, method, params: {
                    code: 0
                }
            });
        })
    },
    //视频播放
    showVideo: ({msgid, method, params}) => {
        ccworkBridge.ccworkPlayShortVideo({
            path: params.path
        }, ({status, errormessage, result}) => {
            if(status != 1) {
                errorHandle(errormessage);
                return
            }
            window.response({
                msgid, method, params: {}
            });
        })
    },
    //音频录制
    sound: ({msgid, method, params}) => {
        ccworkBridge.ccworkTakeShortVideo({
            time: 60,
            quality: 1,
            id: params.id
        }, ({result}) => {
            window.response({
                msgid, method, params: {
                    code: 0
                }
            });
        })
    },
    //音频播放
    soundPlay: ({msgid, method, params}) => {
        ccworkBridge.ccworkPlayShortVideo({
            path: params.path
        }, ({status, errormessage, result}) => {
            if(status != 1) {
                errorHandle(errormessage);
                return
            }
            window.response({
                msgid, method, params: {}
            });
        })
    },
    //摄像抄表
    ocr_watermeter: ({msgid, method, params}) => {
    },
    //手机签字
    signature: ({msgid, method, params}) => {
    },
    //隐藏/显示顶部标题栏
    hideHeader: ({msgid, method, params}) => {
        if(params.hide === 1) {
            ccworkBridge.hideTitleBar((data) => {
                window.response({
                    msgid, method, params: {}
                });
            })
        } else {
            ccworkBridge.showTitleBar((data) => {
                window.response({
                    msgid, method, params: {}
                });
            })
        }
    },
    //资源保存
    resSave: ({msgid, method, params}) => {
        ccworkBridge.savePhotoToGallery({
            imgdata: params.value
        },(data) => {
            window.response({
                msgid, method, params: {code: 0}
            });
        })
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
                errorHandle(errormessage);
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
                errorHandle(errormessage);
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

    },
    //拦截app返回
    interceptBack: ({msgid, method, params}) => {
        ccworkBridge.ccworkInterceptOriginGoback(params.value, () => {}, ({status, errormessage, result}) => {
            if (status != 1) {
                errorHandle(errormessage);
                return
            }
            window.response({
                msgid, method, params: {}
            });
        })
    },
    //数据库执行操作(SQLite)
    sqlite_execsql: ({msgid, method, params}) => {
        ccworkBridge.ccworkExecuteSQL({
            sql: params.sql,
            dbname: params.name,
            dbpwd: "",
            dbpwdMode: "",
        },({status, errormessage, result}) => {
            if(status != 1) {
                errorHandle(errormessage);
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
    //数据库执行操作(SQLite)
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
}

export default ccworkApi;
