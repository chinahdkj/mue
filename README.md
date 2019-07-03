# MUE 和达 Vue 组件库

## 快速上手

+ MUE 安装
npm
```
npm i git+https://hub.hddznet.com/uniplatform/mue.git --save
```


+ MUE 引入
```
import Vue from 'vue'; 
import Mue from 'mue';
// 引入CUE的同时，已全局引用vant-ui。
Vue.use(Mue);
```
+ MUE 样式引入
```
/*
引入的CUE样式包含：
    1. vant-ui 样式
    2. mue 组件样式
    3. hd web 字体图标库
    4. awesome 字体图标库
*/
import 'mue/themes/index.less'; // 样式
```

## [组件示例](http://192.168.100.185:3003)


## 模板项目
```
https://hub.hddznet.com/appv2/h5app-template
```