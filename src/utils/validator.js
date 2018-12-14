import AsyncValidator from 'async-validator';

const MESSAGE = {
    default: '*#{%s}#*校验失败',
    required: '*#{%s}#*必填',
    enum: '*#{%s}#*必须是 %s 中的一个',
    whitespace: '*#{%s}#*不能为空',
    date: {
        format: '*#{%s}#*日期对象 %s 无效，当转换 %s时',
        parse: '*#{%s}#*日期对象不能被解析, %s 无效',
        invalid: '*#{%s}#*日期对象 %s 无效',
    },
    types: {
        string: '*#{%s}#*不是一个 %s',
        method: '*#{%s}#*不是一个 %s (function)',
        array: '*#{%s}#*不是一个 %s',
        object: '*#{%s}#*不是一个 %s',
        number: '*#{%s}#*不是一个 %s',
        date: '*#{%s}#*不是一个 %s',
        boolean: '*#{%s}#*不是一个 %s',
        integer: '*#{%s}#*不是一个 %s',
        float: '*#{%s}#*不是一个 %s',
        regexp: '*#{%s}#*不是一个有效的 %s',
        email: '*#{%s}#*不是一个有效的 %s',
        url: '*#{%s}#*不是一个有效的 %s',
        hex: '*#{%s}#*不是一个有效的 %s',
    },
    string: {
        len: '*#{%s}#*须包含 %s 个字符',
        min: '*#{%s}#*须大于 %s 个字符',
        max: '*#{%s}#*须小于 %s 个字符',
        range: '*#{%s}#*须小于 %s 到 %s 个字符',
    },
    number: {
        len: '*#{%s}#*须等于 %s',
        min: '*#{%s}#*须大于 %s',
        max: '*#{%s}#*须小于 %s',
        range: '*#{%s}#*须介于 %s 、 %s 之间',
    },
    array: {
        len: '*#{%s}#*的长度须等于 %s',
        min: '*#{%s}#*的长度须大于 %s',
        max: '*#{%s}#*的长度须小于 %s',
        range: '*#{%s}#*的长度须介于 %s 、 %s 之间',
    },
    pattern: {
        mismatch: '*#{%s}#*的值 %s 不匹配正则 %s',
    }
};

export default {
    init(rules){
        let schema = new AsyncValidator(rules);
        schema.messages(MESSAGE);
        return schema;
    }
};