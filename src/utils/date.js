window.GetToday = function (t) {
    var current = new Date();
    if(t){
        current=new Date(t*1000);
    }
    return new Date(current.getFullYear(), current.getMonth(), current.getDate());
}

window.GetFirstDayOfMonth = function (t) {
    return GetToday(t).AddDays(1-new Date().getDate());
}

window.ShortTimeFormatter = function (value, row, index) {
    if (value && typeof value == "number") return new Date(value * 1000).ShortTime();
    else if (value == 0) return "";
    else return value;
}

//根据格式化字符串获取日期格式代码
window.GetDateType = function (Format) {
    return Format.replace(/[^yMdHms]/g, "");
};

//把时间字符串转换为Date类型
window.ConvertToDate = function (Value, Format) {
    if (Format == undefined) {
        Format = "yyyy-MM-dd HH:mm:ss";
    }
    var Chars = new Date().FormatString("yyyy/MM/dd HH:mm:ss").split(/[^0-9]/g);
    Value = Value.split(/[^0-9]/g);
    Format = Format.split(/[^yMdHms0-9]/g);
    for (var i = 0, len = Chars.length; i < len; i++) {
        if (Format[i]) {
            switch (Format[i]) {
                case "yyyy":
                    {
                        Chars[0] = Value[i] || Chars[0];
                    }
                    break;
                case "MM":
                case "M":
                    {
                        Chars[1] = Value[i] || Chars[1];
                    }
                    break;
                case "dd":
                case "d":
                    {
                        Chars[2] = Value[i] || Chars[2];
                    }
                    break;
                case "HH":
                case "H":
                    {
                        Chars[3] = Value[i] || Chars[3];
                    }
                    break;
                case "mm":
                case "m":
                    {
                        Chars[4] = Value[i] || Chars[4];
                    }
                    break;
                case "ss":
                case "s":
                    {
                        Chars[5] = Value[i] || Chars[5];
                    }
                    break;
                default:
                    {
                        Chars[i] = Format[i];
                    }
                    break;
            }
        }
        else {
            switch (i) {
                case 1:
                case 2:
                    {
                        Chars[i] = "01";
                    }
                    break;
                default:
                    {
                        Chars[i] = "00";
                    }
                    break;
            }
        }
    }

    Chars.splice(5, 0, ":");
    Chars.splice(4, 0, ":");
    Chars.splice(3, 0, " ");
    Chars.splice(2, 0, "/");
    Chars.splice(1, 0, "/");

    return new Date(Chars.join(""));
}

//获取当前日期 return string
Date.prototype.GetYMD = function () {
    var today = GetToday();
    return today.FormatString("yyyy-MM-dd");
}

//克隆日期时间对象
Date.prototype.Clone = function () {
    return new Date(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds());
};

/*
* 输出格式化日期字符串
* Format:时间格式
*/
Date.prototype.FormatString = function (Format) {
    if (Format.length == 0) {
        Format = "yyyy-MM-dd HH:mm:ss";
    }
    Format = Format.replace(/yyyy/g, this.getFullYear());
    Format = Format.replace(/yy/g, this.getFullYear().toString().slice(2));
    var MonthStr = this.getMonth() + 1;
    if (String(MonthStr).length == 1) {
        MonthStr = "0" + MonthStr;
    }
    Format = Format.replace(/MM/g, MonthStr);
    Format = Format.replace(/M/g, this.getMonth() + 1);
    var DateStr = this.getDate();
    if (String(DateStr).length == 1) {
        DateStr = "0" + DateStr;
    }
    Format = Format.replace(/dd/g, DateStr);
    Format = Format.replace(/d/g, this.getDate());
    var HourStr = this.getHours();
    if (String(HourStr).length == 1) {
        HourStr = "0" + HourStr;
    }
    Format = Format.replace(/HH/g, HourStr);
    Format = Format.replace(/H/g, this.getHours());
    var MinuteStr = this.getMinutes();
    if (String(MinuteStr).length == 1) {
        MinuteStr = "0" + MinuteStr;
    }
    Format = Format.replace(/mm/g, MinuteStr);
    Format = Format.replace(/m/g, this.getMinutes());
    var SecondStr = this.getSeconds();
    if (String(SecondStr).length == 1) {
        SecondStr = "0" + SecondStr;
    }
    Format = Format.replace(/ss/g, SecondStr);
    Format = Format.replace(/s/g, this.getSeconds());

    var MillisecondStr = this.getMilliseconds();
    if (String(MillisecondStr).length == 1) {
        MillisecondStr = "00" + MillisecondStr;
    }
    if (String(MillisecondStr).length == 2) {
        MillisecondStr = "0" + MillisecondStr;
    }
    Format = Format.replace(/SSS/g, MillisecondStr);
    Format = Format.replace(/SS/g, this.getMilliseconds());
    Format = Format.replace(/S/g, this.getMilliseconds());
    return Format;
};
//获取日期的星期几
Date.prototype.GetDayOfWeek = function () {
    var Str = "";
    switch (this.getDay()) {
        case 0:
            {
                Str = "星期日";
            }
            break;
        case 1:
            {
                Str = "星期一";
            }
            break;
        case 2:
            {
                Str = "星期二";
            }
            break;
        case 3:
            {
                Str = "星期三";
            }
            break;
        case 4:
            {
                Str = "星期四";
            }
            break;
        case 5:
            {
                Str = "星期五";
            }
            break;
        case 6:
            {
                Str = "星期六";
            }
            break;
    }
    return Str;
};
//增加指定秒数
Date.prototype.AddSeconds = function (Count) {
    return new Date(Number(this) + Count * 1000);
};
//增加指定分钟数
Date.prototype.AddMinutes = function (Count) {
    return new Date(Number(this) + Count * 60000);
};
//增加指定小时数
Date.prototype.AddHours = function (Count) {
    return new Date(Number(this) + Count * 3600000);
};
//增加指定天数
Date.prototype.AddDays = function (Count) {
    return new Date(Number(this) + Count * 86400000);
};
//增加指定月数
Date.prototype.AddMonths = function (Count) {
    var Dt = new Date(this.getFullYear(), this.getMonth() + Count, this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds());
    if ((Dt.getMonth() - 12) % 12 == (this.getMonth() + Count - 12) % 12) {
        return Dt;
    }
    else {
        return ConvertToDate(Dt.FormatString("yyyy-MM-01 HH:mm:ss"), "yyyy-MM-dd HH:mm:ss").AddDays(-1);
    }
};
//增加指定年数
Date.prototype.AddYears = function (Count) {
    return new Date(this.getFullYear() + Count, this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds());
};
//获取日期在当年中的第几周
Date.prototype.GetWeekOfYear = function () {
    var FDY = new Date(this.getFullYear(), 0, 1);
    return ("" + (((this - FDY) / 86400000 + 13 - FDY.getDay()) / 7)).replace(/\.[0-9]*$/g, "");
};
//获取时间戳（秒数）
Date.prototype.GetTimeStamp = function () {
    return parseInt(this.getTime() / 1000);
};

//用于时间简写
Date.prototype.ShortTime = function () {
    var str = this.FormatString("yyyy-MM-dd HH:mm");
    var day = new Date().FormatString("yyyy-MM-dd ");
    str = str.replace(day, "");
    var year = new Date().FormatString("yyyy-");
    return str.replace(year, "");
};
