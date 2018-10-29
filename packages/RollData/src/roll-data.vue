<template>
    <div class="mue-roll-data">
        <h6 class="mue-roll-data--value" :class="valueClass" :style="valueStyle">
            <transition name="value-toggle" appear @after-leave="onHided">
                <span style="display: block;" v-show="visible">{{value}}</span>
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
        data(){
            return {
                visible: true
            };
        },
        methods: {
            onHided(){
                this.visible = true;
            }
        },
        watch: {
            value: {
                handler(){
                    this.visible = false;
                }
            }
        },
        components: {}
    }
</script>
