<template>
    <div class="mue-actionsheet">
        <van-popup v-model="visible"
                   position="bottom"
                   class="actionsheet-popup"
                   :class="{'round' : round}"
                   v-on="$listeners"
                   :close-on-click-overlay="closeOnClickOverlay">
            <div class="mue-actionsheet-header" v-if="$slots['header'] || title">
                <slot name="header">
                    {{ title }}
                </slot>
            </div>
            <ul class="list">
                    <li v-for="(action, index) in actions"
                        :key="index" class="item"
                        :class="{'disabled': action.disabled}" :style="'width:' + itemWidth"
                        @click="handleClick(action, index)">
                        <slot :action="action" :index="index">
                            <div class="icon-box" :style="'background-color:' + action.background">
                                <i :class="action.icon"></i>
                            </div>
                            <div class="name">{{ action.name }}</div>
                        </slot>
                    </li>
                </ul>
            <div v-if="cancelText" class="cancel-btn" @click="cancel">{{cancelText}}</div>
        </van-popup>
    </div>
</template>

<script>
    export default {
        name: 'MueActionsheet',
        props: {
            title:{
                type: String,
                default: ''
            },
            value: {
                type: Boolean,
                default: false
            },
            actions: {
                type: Array,
                default() {
                    return []
                }
            },
            cols: {
                type: Number,
                default: 5
            },
            cancelText: {
                type: String,
                default: ''
            },
            round: {
                type: Boolean,
                default: true
            },
            closeOnClickAction: {
                type: Boolean,
                default: false
            },
            closeOnClickOverlay: {
                type: Boolean,
                default: true
            }
        },
        computed: {
            visible: {
                get() {
                    return this.value
                },
                set(nv) {
                    this.$emit('input', nv);
                }
            },
            itemWidth() {
                return `${100/this.cols}%`
            }
        },
        data() {
            return {}
        },
        methods: {
            handleClick(action, index) {
                if (action.disabled) {
                    return
                }
                this.$emit('select', action, index);
                if (this.closeOnClickAction) {
                    this.visible = false;
                }
            },
            cancel() {
                this.$emit('cancel');
                this.visible = false;
            }
        }
    };
</script>
