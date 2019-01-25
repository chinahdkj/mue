<template>
    <div class="mue-img-upload">
        <ul class="mue-img-upload-list">
            <li class="__upload-btn" v-if="!FORM_ITEM.readonly">
                <van-loading v-if="uploading" color=""/>
                <van-uploader v-else :disabled="disabled" :after-read="upload" accept="*/*"
                              result-type="dataUrl">
                              <!-- :multiple="multiple" -->
                    <i v-if="imgs&&imgs.length>0" class="iconfont icon-baobiao-weixuanzhong" style="font-size: 30px; display: block;  height: 46px;  width: 46px;  line-height: 46px;  text-align: center;" :class="{'is-disabled': disabled}"  
                       aria-hidden="true"></i>
                    <i v-else class="iconfont icon-tianjia" :class="{'is-disabled': disabled}"
                       aria-hidden="true"></i>
                </van-uploader>
            </li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: "MueUpload",
        components: {},
        inject: {
            FORM_ITEM: {
                from: "FORM_ITEM",
                default(){
                    return {};
                }
            }
        },
        props: {
            value: {type: [String, Array], default: ""},
            disabled: {type: Boolean, default: false},
            // multiple: {type: Boolean, default: false}
        },
        data(){
            return {
                imgs: [], uploading: false
            };
        },
        watch: {
            value: {
                immediate: true,
                handler(v){
                    if(!this.multiple){
                        this.imgs = v ? [v] : [];
                    }
                    else{
                        this.imgs = v;
                    }
                }
            },
            imgs(v){
                if(this.multiple){
                    this.$emit("input", v);
                }
                else{
                    this.$emit("input", v.length === 0 ? "" : v[0]);
                }

            }
        },
        methods: {
            base64ToFile(base64, file){

                let arr = base64.split(",");
                let mime = arr[0].match(/:(.*?);/)[1];// 结果：   image/png
                let bytes = atob(arr[1].replace(/\s/g, ""));
                let n = bytes.length;
                let u8arr = new Uint8Array(n);
                for(let i = 0; i < n; i++){
                    u8arr[i] = bytes.charCodeAt(i);
                }

                return new File([u8arr], file.name, {type: mime});
            },

            upload(files){
                this.uploading = true;
                if(!Array.isArray(files)){
                    files = [files];
                }
                let posts = files.map(({content, file}) => {

                    let form = new FormData();
                    let f = this.base64ToFile(content, file);
                    form.append("file", file);

                    return this.$http.post("/app/v1.0/upload.json", form, {
                        processData: false, contentType: false
                    });
                });
                this.$ajax.all(posts).then((rs) => {
                    if(this.multiple){
                        rs.forEach(({url}) => {
                            this.imgs.push(url);
                        });
                    }
                    else{
                        this.imgs = rs.length > 0 ? [rs[0].url] : [];
                    }
                    this.uploading = false;
                }).catch(()=>{
                    this.uploading = false;
                });
            }
        }
    }
</script>