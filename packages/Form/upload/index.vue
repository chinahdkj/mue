<template>
    <div class="mue-upload">
        <ul class="mue-upload-list">
            <li v-for="(file, i) in thumbs" :key="i" class="__upload-file">
                <div class="box" @click="showAction(i)">
                    <i class="iconfont icon-baobiao-weixuanzhong"></i>
                    <span class="text">{{file.name}}</span>
                </div>
            </li>
            <li class="__upload-btn" v-if="!isReadonly && uploadAble">
                <van-loading v-if="uploading" color=""/>
                <van-uploader v-else :disabled="disabled" :after-read="upload" :before-read="beforeRead"
                              accept="*/*" result-type="dataUrl" :multiple="multiple">
                              <!-- :multiple="multiple" -->
                    <i class="iconfont icon-tianjia" :class="{'is-disabled': disabled}"
                       aria-hidden="true"></i>
                </van-uploader>
            </li>
        </ul>
        <van-actionsheet v-model="pop.visible" get-container="body" cancel-text="取消"
                         @select="onSelect"
                         :actions="[{name: '删除', act: 'delete'}]"/>
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
            readonly: {type: Boolean, default: false},
            multiple: {type: Boolean, default: false},
            limit: {type: Number, default: 0}
        },
        data(){
            return {
                files: [], thumbs: [], uploading: false, dict: {},
                pop: {visible: false, current: -1}
            };
        },
        computed: {
            uploadAble() {
                if(!this.multiple){
                    return this.files.length < 1;
                }
                return this.limit > 0 ? this.files.length < this.limit : true;
            },
            isReadonly(){
                return this.FORM_ITEM.readonly || this.readonly;
            }
        },
        watch: {
            value: {
                immediate: true,
                handler(v){
                    let temp = [];
                    if(!v){
                    }
                    else if(Array.isArray(v)){
                        temp = v;
                    }else{
                        temp = [v];
                    }
                    this.files = temp;
                }
            },
            files: {
                deep: true, immediate: true,
                handler(v) {
                    if(this.multiple){
                        this.$emit("input", v);
                    }
                    else{
                        this.$emit("input", v.length === 0 ? "" : v[0]);
                    }
                    this.dict = {};
                    let ids = Object.values(v);
                    if(ids.length === 0){
                        this.createThumbs();
                        return;
                    }
                    this.$http.post('/app/redirect/upload/infos',{ids}).then((res)=>{
                        console.log(res);
                        v.forEach((p) => {
                            this.$set(this.dict, p, {
                                url: p,
                                name: res[p].name
                            });
                        });
                        this.createThumbs();
                    });
                }
            }
        },
        methods: {
            createThumbs() {
                this.thumbs = this.files.map((p) => {
                    return this.getFile(p);
                })
            },
            getFile(p) {
                let url = this.dict[p].url;
                return {url: this.getPath(url), name: this.dict[p].name}
            },
            getPath(m) {
                if (!m) {
                    return "";
                }
                if (m.startsWith("/upload")) {
                    return `${sessionStorage.getItem("host") || ""}${m}`;
                }
                return m;
            },
            showAction(i) {
                this.pop.current = i;
                if (this.isReadonly) {
                    window.open(`${this.getPath(this.files[i])}?origname=1`); //下载
                    return;
                }
                this.pop.visible = true;
            },
            onSelect({act}) {
                if (act === "delete") {
                    this.removeImg();
                }
                this.pop.visible = false;
            },
            removeImg() {
                if (this.disabled) {
                    return;
                }

                this.$dialog.confirm({
                    title: "删除", message: `是否删除此文件？`
                }).then(() => {
                    this.files.splice(this.pop.current, 1);
                }).catch(() => {
                });
            },
            beforeRead(files) {
                let fileArr = Array.isArray(files) ? [...files] : [files];
                if(this.limit <= 0){
                    return true;
                }
                let limit = this.multiple ? this.limit : 1;
                if(fileArr.length <= limit && ((this.files.length + fileArr.length) <= limit)){
                    return true
                }
                this.$toast.fail(`上传文件不能超过${this.limit}个`);
                return false;
            },
            base64ToFile(base64, file){

                let arr = base64.split(",");
                let mime = arr[0].match(/:(.*?);/)[1];// 结果：   image/png
                let bytes = atob(arr[1].replace(/\s/g, ""));
                let n = bytes.length;
                let u8arr = new Uint8Array(n);
                for(let i = 0; i < n; i++){
                    u8arr[i] = bytes.charCodeAt(i);
                }

                let blob = new Blob([u8arr], {type: file.type});
                blob.lastModifiedDate = new Date();
                blob.name = file.name;
                return blob;
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
                    // form.append("id", file.name);

                    return this.$http.post("/app/v1.0/upload.json", form, {
                        processData: false, contentType: false
                    });
                });
                this.$ajax.all(posts).then((rs) => {
                    if(this.multiple){
                        rs.forEach(({url}) => {
                            this.files.push(url);
                        });
                    }
                    else{
                        this.files = rs.length > 0 ? [rs[0].url] : [];
                    }
                    this.uploading = false;
                }).catch(()=>{
                    this.uploading = false;
                });
            }
        }
    }
</script>