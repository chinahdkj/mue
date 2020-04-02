import {Locale} from "vant";
import {objectGet} from "../utils/object";

import EN from "./lang/en";
import ZH_CN from "./lang/zh-CN";

let _lang = ZH_CN;

const getLanguage = (name) => {
    if(name === "en"){
        return EN;
    }
    else{
        return ZH_CN;
    }
};

export const use = (name) => {
    let lang = getLanguage(name);
    if(!lang){
        return;
    }
    _lang = lang;
    // 设置vant 语言
    Locale.use(lang.vant.code, lang.vant.lang);
};


export const t = (path, args) => {
    let v = objectGet(_lang, path);
    if(v == undefined){
        return "";
    }
    else if(typeof v === "function"){
        return v(args);
    }
    else{
        return v;
    }
};

export const localeMixin = {
    methods: {
        t(path, args){
            return t(path, args);
        }
    }
};

