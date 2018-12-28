<template>
    <div class="mue-roll-data">
        <h6 class="mue-roll-data--value" :class="valueClass" :style="valueStyle">
            <transition name="value-toggle" appear @after-leave="onHided">
                <span style="display: block;" v-show="visible">{{prev}}
                    <slot v-if="size === 'large'" name="end"></slot>
                </span>
            </transition>
        </h6>
        <span class="mue-roll-data--title" :class="titleClass" :style="titleStyle">{{title}}</span>
    </div>
</template>

<script>

    export default {
        name: "MueRollData",
        props: {
            title: String,
            value: [String, Number],
            titleClass: null,
            titleStyle: null,
            valueClass: null,
            valueStyle: null,
        },
        inject: {
            RDGROUP: {
                from: "RDGROUP",
                default(){
                    return {};
                }
            }
        },
        data(){
            return {
                prev: this.value, next: "",
                visible: true
            };
        },
        computed:{
            size(){
                return this.RDGROUP.size || "large";
            }
        },
        methods: {
            onHided(){
                this.prev = this.next;
                this.next = "";
                this.visible = true;
            }
        },
        watch: {
            value: {
                handler(v, ov){
                    this.prev = ov;
                    this.next = v;
                    this.visible = false;
                }
            }
        },
        components: {}
    }
</script>
