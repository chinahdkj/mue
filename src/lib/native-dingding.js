/*
* 钉钉方法代替原生方法
*/
import {device} from "dingtalk-jsapi";

const _getLocation = ({msgid, method, params}) => {
    window.response({
        msgid, method, params: null
    });
    // device.geolocation.get({
    //     targetAccuracy: 50,
    //     coordinate: 1,
    //     withReGeocode: false,
    //     useCache: false,
    //     onSuccess(result) {
    //         window.response({
    //             msgid, method, params: {
    //                 lat: result.latitude, lng: result.longitude, addr: result.address
    //             }
    //         });
    //     }
    // });
};

export const getLocation = _getLocation;