import MegaPixImage from "./megapix-image";
import {isIos} from "../lib/common";

function zipImg(base64, type, quality, maxWidth, callback){
    let img = new Image();
    img.crossOrigin = "anonymous";
    img.src = base64;

    img.onload = function(){

        let height = img.height;
        let width = img.width;

        if(maxWidth && width > maxWidth){
            let hw = height / width;
            width = maxWidth;
            height = hw * width;
        }

        let canvas = document.createElement("canvas");
        canvas.height = height;
        canvas.width = width;
        let ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, width, height);

        callback(canvas.toDataURL(type, quality));
    };
}

export const Base64ToFile = (base64, {type, name}) => {

    let arr = base64.split(",");
    let bytes = atob(arr[1].replace(/\s/g, ""));
    let n = bytes.length;
    let u8arr = new Uint8Array(n);
    for(let i = 0; i < n; i++){
        u8arr[i] = bytes.charCodeAt(i);
    }

    let blob = new Blob([u8arr], {type});
    blob.lastModifiedDate = new Date();
    blob.name = name;
    return blob;
};

export const ZipImage = (base64, {type, name}, quality, maxWidth) => {

    return new Promise((resolve) => {
        if(quality === 1 && !maxWidth){
            resolve({content: base64, file: {type, name}});
            return;
        }

        if(isIos()){
            let mp = new MegaPixImage(Base64ToFile(base64, {type, name}));
            let canvas = document.createElement("canvas");
            mp.render(canvas, {maxWidth, quality}, () => {
                let content = canvas.toDataURL(type, quality);
                resolve({content, file: {type, name}});
            });
        }
        else{
            zipImg(base64, type, quality, maxWidth, (content) => {
                resolve({content, file: {type, name}});
            });
        }
    });
};

