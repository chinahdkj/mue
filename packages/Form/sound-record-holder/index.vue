<template>
    <div class="mue-sound-record">

    </div>
</template>

<script>
import {localeMixin, t} from "../../../src/locale";
export default {
    name: "MueSoundRecordHolder",
    mixins: [localeMixin],
    components: {},
    inject: {
        FORM_ITEM: {
            from: "FORM_ITEM",
            default() {
                return {};
            }
        }
    },
    props: {
        value: {type: [String, Array], default: ""},
        disabled: {type: Boolean, default: false},
        readonly: {type: Boolean, default: false},
        multiple: {type: Boolean, default: false},
        local: {type: Boolean, default: false},
        limit: {type: Number, default: 5}
    },
    data() {
        return {
            audios: [],
            recording: false,
            dict: {},
            pop: {visible: false},
            current: -1
        };
    },
    computed: {
        recordAble() {
            if (!this.multiple) {
                return this.audios.length < 1;
            }
            return this.limit > 0 ? this.audios.length < this.limit : true;
        },
        isReadonly(){
            return this.FORM_ITEM.readonly || this.readonly;
        }
    },
    watch: {
        value: {
            immediate: true, deep: true,
            handler(v) {
                let temp = [];
                if (!v) {
                }
                else if (Array.isArray(v)) {
                    temp = v;
                } else {
                    temp = [v];
                }
                this.audios = temp;
            }
        },
        audios: {
            deep: true, immediate: true,
            handler(v) {
                if (!Array.isArray(v)) {
                    return
                }

                if (this.multiple) {
                    this.$emit("input", v);
                }
                else {
                    this.$emit("input", v.length === 0 ? "" : v[0]);
                }

                this.dict = {};
                v.forEach((p) => {
                    this.$set(this.dict, p, {
                        url: p,
                        path: this.getPath(p),
                        local: false
                    });
                });

                if (this.local) {
                    let prms = v.map((p) => {
                        return this.queryLocal(p);
                    });

                    Promise.all(prms).then((datas) => {
                        for (let i = 0; i < datas.length; i++) {
                            let {_id, data} = datas[i];
                            if (!_id) {
                                continue;
                            }
                            data = JSON.parse(data);
                            this.$set(this.dict, _id, {
                                url: _id,
                                path: data.path,
                                local: true
                            });
                        }
                    });
                }
            }
        }
    },
    methods: {

    }
}
</script>

<style scoped>

</style>