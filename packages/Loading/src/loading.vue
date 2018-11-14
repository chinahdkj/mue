<template>
    <transition name="vant-fade">
        <div
            v-show="visible"
            class="mue-loading-mask"
            :class="{ 'is-fullscreen': fullscreen }">
            <div class="mue-loading-spinner">
                <i class="spinner"></i>
                <span v-if="text" class="mue-loading-text">{{text}}</span>
            </div>
        </div>
    </transition>
</template>

<script>
    export default {
        data(){
            return {
                text: null,
                spinner: null,
                fullscreen: true,
                visible: false
            };
        },

        methods: {
            setText(text){
                this.text = text;
            }
        }
    };
</script>
