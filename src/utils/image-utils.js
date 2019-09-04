import MegaPixImage from "./megapix-image";
import {isIos} from "../lib/common";
import EXIF from 'exif-js';

function zipImg(base64, file, quality, maxWidth, orientation, callback) {
    let img = new Image();
    img.crossOrigin = "anonymous";
    img.src = base64;

    img.onload = function () {

        let height = img.height;
        let width = img.width;

        if (maxWidth && width > maxWidth) {
            let hw = height / width;
            width = maxWidth;
            height = hw * width;
        }

        let canvas = document.createElement("canvas");
        canvas.height = height;
        canvas.width = width;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // if (Orientation && Orientation !== 1) {
        //     switch (Orientation) {
        //         case 6://顺时针（向左）90度旋转
        //             alert('需要顺时针（向左）90度旋转');
        //             rotateImg(img, 'left', canvas);
        //             break;
        //         case 8://逆时针（向右）90度旋转
        //             alert('需要顺时针（向右）90度旋转');
        //             rotateImg(img, 'right', canvas);
        //             break;
        //         case 3://180度旋转
        //             alert('需要180度旋转');
        //             rotateImg(img, 'right', canvas);
        //             rotateImg(img, 'right', canvas);
        //             break;
        //     }
        // }

        callback(canvas.toDataURL(file.type, quality));
    };
}

export const rotateImg = (img, angle, canvas) => {
    if (img == null)
        return;
    let height = img.height, width = img.width;
    let step;
    let rotateAngle = angle % 360;
    if(rotateAngle === 0) {
        step = 0
    } else if(rotateAngle === 90 || rotateAngle === -270) {
        step = 1
    } else if(Math.abs(rotateAngle) === 180) {
        step = 2
    } else {
        step = 3
    }
    //最小与最大旋转方向，图片旋转4次后回到原方向
    /*let min_step = 0, max_step = 3;
    if (img == null)
        return;
    let height = img.height, width = img.width;
    let step = 2;
    if (step === null) {
        step = min_step;
    }
    if (direction === 'right') {
        step++;
        //旋转到原位置，即超过最大值
        step > max_step && (step = min_step);
    } else {
        step--;
        step < min_step && (step = max_step);
    }*/
    //旋转角度以弧度值为参数
    let degree = step * 90 * Math.PI / 180;
    let ctx = canvas.getContext('2d');
    switch (step) {
        case 0:
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0);
            break;

        case 1:
            canvas.width = height;
            canvas.height = width;
            ctx.rotate(degree);
            ctx.drawImage(img, 0, -height);
            break;
        case 2:
            canvas.width = width;
            canvas.height = height;
            ctx.rotate(degree);
            ctx.drawImage(img, -width, -height);
            break;
        case 3:
            canvas.width = height;
            canvas.height = width;
            ctx.rotate(degree);
            ctx.drawImage(img, -width, 0);
            break;
    }
}

export const Base64ToFile = (base64, {type, name}) => {

    let arr = base64.split(",");
    let bytes = atob(arr[1].replace(/\s/g, ""));
    let n = bytes.length;
    let u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
        u8arr[i] = bytes.charCodeAt(i);
    }

    let blob = new Blob([u8arr], {type});
    blob.lastModifiedDate = new Date();
    blob.name = name;
    return blob;
};

export const ZipImage = (base64, file, quality, maxWidth) => {

    return new Promise((resolve) => {
        EXIF.getData(file, function () {
            EXIF.getAllTags(this);
            let orientation = EXIF.getTag(this, 'Orientation'); // 1:0° 6:90° 8:-90° 3:180°
            if (quality === 1 && !maxWidth) {
                if (isIos()) {
                    let mp = new MegaPixImage(Base64ToFile(base64, {type: file.type, name: file.name}));
                    let canvas = document.createElement("canvas");
                    mp.render(canvas, {quality, orientation}, () => {
                        let content = canvas.toDataURL(file.type, quality);
                        resolve({content, file: {type: file.type, name: file.name}});
                    });
                } else {
                    resolve({content: base64, file: {type: file.type, name: file.name}});
                }
                return;
            }

            if (isIos()) {
                let mp = new MegaPixImage(Base64ToFile(base64, {type: file.type, name: file.name}));
                let canvas = document.createElement("canvas");
                mp.render(canvas, {maxWidth, quality, orientation}, () => {
                    let content = canvas.toDataURL(file.type, quality);
                    resolve({content, file: {type: file.type, name: file.name}});
                });
            }
            else {
                zipImg(base64, file, quality, maxWidth, orientation, (content) => {
                    resolve({content, file: {type: file.type, name: file.name}});
                })
            }
        });
    });
};

