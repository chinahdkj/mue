export function GetType(fmt){

    if(fmt.indexOf("H") > -1){
        return fmt.indexOf("d") > -1 ? "datetime" : "time";
    }
    return fmt.indexOf("d") > -1 ? "date" : "year-month";

}


export function Date2String(date, fmt = "yyyy-MM-dd"){

    fmt = fmt.replace(/yyyy/g, date.getFullYear());
    fmt = fmt.replace(/yy/g, date.getFullYear().toString().slice(2));
    let m = date.getMonth() + 1;
    if(String(m).length === 1){
        m = "0" + m;
    }
    fmt = fmt.replace(/MM/g, m);
    fmt = fmt.replace(/M/g, date.getMonth() + 1);
    let d = date.getDate();
    if(String(d).length === 1){
        d = "0" + d;
    }
    fmt = fmt.replace(/dd/g, d);
    fmt = fmt.replace(/d/g, date.getDate());
    let h = date.getHours();
    if(String(h).length === 1){
        h = "0" + h;
    }
    fmt = fmt.replace(/HH/g, h);
    fmt = fmt.replace(/H/g, date.getHours());
    let mi = date.getMinutes();
    if(String(mi).length === 1){
        mi = "0" + mi;
    }
    fmt = fmt.replace(/mm/g, mi);
    fmt = fmt.replace(/m/g, date.getMinutes());
    let s = date.getSeconds();
    if(String(s).length == 1){
        s = "0" + s;
    }
    fmt = fmt.replace(/ss/g, s);
    fmt = fmt.replace(/s/g, date.getSeconds());

    var ms = date.getMilliseconds();
    if(String(ms).length == 1){
        ms = "00" + ms;
    }
    if(String(ms).length == 2){
        ms = "0" + ms;
    }
    fmt = fmt.replace(/SSS/g, ms);
    fmt = fmt.replace(/SS/g, date.getMilliseconds());
    fmt = fmt.replace(/S/g, date.getMilliseconds());
    return fmt;
}

export function String2Date(value, fmt = "yyyy-MM-dd"){
    let chs = Date2String(new Date(), "yyyy/MM/dd HH:mm:ss").split(/[^0-9]/g);
    let vals = value.split(/[^0-9]/g);
    let format = fmt.split(/[^yMdHms0-9]/g);
    for(let i = 0, len = chs.length; i < len; i++){
        if(format[i]){
            switch(format[i]){
                case "yyyy":{
                    chs[0] = vals[i] || chs[0];
                }
                    break;
                case "MM":
                case "M":{
                    chs[1] = vals[i] || chs[1];
                }
                    break;
                case "dd":
                case "d":{
                    chs[2] = vals[i] || chs[2];
                }
                    break;
                case "HH":
                case "H":{
                    chs[3] = vals[i] || chs[3];
                }
                    break;
                case "mm":
                case "m":{
                    chs[4] = vals[i] || chs[4];
                }
                    break;
                case "ss":
                case "s":{
                    chs[5] = vals[i] || chs[5];
                }
                    break;
                default:{
                    chs[i] = format[i];
                }
                    break;
            }
        }
        else{
            switch(i){
                case 1:
                case 2:{
                    chs[i] = "01";
                }
                    break;
                default:{
                    chs[i] = "00";
                }
                    break;
            }
        }
    }

    chs.splice(5, 0, ":");
    chs.splice(4, 0, ":");
    chs.splice(3, 0, " ");
    chs.splice(2, 0, "/");
    chs.splice(1, 0, "/");

    return new Date(chs.join(""));
}
