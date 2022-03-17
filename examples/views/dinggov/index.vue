<template>
  <div>
    <van-row class="grid">
        <van-col span="8">
            <div class="grid-item" @click="closePage">
                关闭页面
            </div>
        </van-col>
        <van-col span="8">
            <div class="grid-item" @click="goback">
                返回上一页
            </div>
        </van-col>
        <van-col span="8">
            <div class="grid-item" @click="setTitle">
                设置标题
            </div>
        </van-col>
        <van-col span="8">
            <div class="grid-item" @click="setStorage">
                设置Storage
            </div>
        </van-col>
        <van-col span="8">
            <div class="grid-item" @click="getStorage">
                获取Storage
            </div>
        </van-col>
        <van-col span="8">
            <div class="grid-item" @click="removeStorage">
                删除Storage
            </div>
        </van-col>
        <van-col span="8">
            <div class="grid-item" @click="getLocation">
                获取定位/并导航
            </div>
        </van-col>
        <van-col span="8">
            <div class="grid-item" @click="getUserInfo">
                获取用户信息
            </div>
        </van-col>
        <van-col span="8">
            <div class="grid-item" @click="chooseFile">
                文件获取
            </div>
        </van-col>
        <van-col span="8">
            <div class="grid-item" @click="video">
                视频录制
            </div>
        </van-col>
        <van-col span="8">
            <div class="grid-item" @click="radio">
                音频录制
            </div>
        </van-col>
        <van-col span="8">
            <div class="grid-item" @click="vibratorSound">
                噪声巡检
            </div>
        </van-col>
        <van-col span="8">
            <div class="grid-item" @click="toggleTitle(1)">
                隐藏标题栏
            </div>
        </van-col>
        <van-col span="8">
            <div class="grid-item" @click="toggleTitle(0)">
                显示标题栏
            </div>
        </van-col>
        <van-col span="8">
            <div class="grid-item" @click="scanCode">
                扫码
            </div>
        </van-col>
        <van-col span="8">
            <div class="grid-item" @click="share">
                分享
            </div>
        </van-col>
        <van-col span="8">
            <div class="grid-item" @click="shareFile">
                分享文件
            </div>
        </van-col>
        <van-col span="8">
            <div class="grid-item" @click="sysInfo">
                获取应用信息
            </div>
        </van-col>
        <van-col span="8">
            <div class="grid-item" @click="rotate">
                横竖屏切换
            </div>
        </van-col>
        <van-col span="8">
            <div class="grid-item" @click="watermarkCamera">
                水印相机
            </div>
        </van-col>
    </van-row>

  </div>
</template>

<script>

export default {
    data(){
        return{
            callback:null,
            content:'',
        }
    },
    methods:{
        // 关闭页面
        closePage(){
            this.$comm.closePage()
        },
        // 设置标题 
        setTitle(){
            this.$comm.setDocumentTitle('设置标题' + new Date().getSeconds())
        },
        // 设置setStorage
        setStorage(){
           this.$native.save({
                params: {
                    key:'stroage',
                    value:'测试stroage' + new Date().getTime()
                },
                cb: (result) => {
                    console.log("设置setStorage", result);
                }
            });
        },
        // 获取setStorage
        getStorage(){
           this.$native.query({
                params: {
                    key:'stroage',
                },
                cb: (result) => {
                    console.log("获取setStorage", result);
                }
            });
        },
        // 删除storage
        removeStorage(){
            this.$native.delete({
                params: {
                    key:'stroage',
                },
                cb: (result) => {
                    console.log("删除setStorage", result);
                }
            });
        },
        // 获取定位
        getLocation(){
            this.$native.getLocation({
                params:{},
                cb:(res)=>{
                    console.log({res})
                    this.$native.startNavi({
                        params:{
                            lat:30.412655,
                            lng:120.315934,
                            addr:res.addr,
                            startLat:res.lat,
                            startLng:res.lng
                        },
                        cb:(r)=>{
                            console.log({r})
                        }
                    })
                }
            })
        },
        // 获取用户信息
        getUserInfo(){
            this.$native.userInfo({
                params:{},
                cb:(res)=>{
                    console.log(res)
                }
            })            
        },
        // 文件获取
        chooseFile(){
            this.$native.multi_file({
                params:{
                    maxNum:9
                },
                cb:(res)=>{
                    console.log(res)
                }
            })
        },
        // 视频露在
        video(){
            this.$native.video({
                params:{},
                cb:(res)=>{
                    console.log(res)
                }
            })            
        },
        // 音频录制
        radio(){
            this.$native.sound({
                params:{},
                cb:(res)=>{
                    // console.log(res)
                }
            })  
        },
        // 噪声巡检
        vibratorSound(){
            this.$native.vibratorSound({
                params:{},
                cb:(res)=>{
                    // console.log(res)
                }
            })
        },
        // 切换显示标题栏
        toggleTitle(hide = 0){
            this.$native.hideHeader({
                params:{
                    hide:hide
                },
                cb:(res)=>{
                    // console.log(res)
                }
            })
        },
        // 扫码
        scanCode(){
            this.$native.scanCode({
                params:{},
                cb:(res)=>{
                    console.log(res)
                }
            })
        },
        // 分享
        share(){
            this.$native.share({
                params:{
                    url:'https://www.baidu.com',
                    title:'测试分享',
                    content:'分享内容',
                    image:'https://img.alicdn.com/imgextra/i3/O1CN01ynwP0x1LN22wntVym_!!6000000001286-2-tps-372-80.png'
                },
                cb:(res)=>{
                    console.log(res)
                }
            })
        },
        // 分享文件
        shareFile(){
            this.$native.shareFile({
                params:{
                    path:'https://github.com/Tencent/vConsole/archive/refs/heads/dev.zip',
                    name:'dev.zip'
                },
                cb:(res)=>{
                    console.log(res)
                }
            })            
        },
        // 获取应用信息
        sysInfo(){
            this.$native.sysInfo({
                params:{},
                cb:(res)=>{
                    console.log(res)
                }
            })            
        },
        // 返回上一页
        goback(){
            this.$native.goback({
                params:{},
                cb:(res)=>{
                    console.log(res)
                }
            })   
        },
        // 横竖屏切换
        rotate(){
            this.$native.rotate({
                params:{},
                cb:(res)=>{
                    console.log(res)
                }
            })   
        },
        // 水印相机
        watermarkCamera(){
            this.$native.watermarkCamera({
                params:{},
                cb:(res)=>{
                    console.log(res)
                }
            })   
        },

    }
}
</script>

<style lang="less" scoped>
.grid{
    .van-col{
        box-sizing: border-box;
        border-bottom: 0.5px solid #eee;
        border-right: 0.5px solid #eee;
        position: relative;
        &::after{
            content: '';
            padding-bottom: 100%;
            display: block;
            width: 100%;
        }
        .grid-item{
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
}

</style>