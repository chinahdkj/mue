<template>
    <section class="mue-page">
        <header v-if="$slots.header" class="mue-page-header" :style="{height: hheight}">
            <slot name="header"></slot>
        </header>

        <section class="mue-page-content" :style="{height: cheight}">
            <slot></slot>
        </section>

        <footer v-if="$slots.footer" class="mue-page-footer" :style="{height: fheight}">
            <slot name="footer"></slot>
        </footer>
    </section>
</template>

<script>
    export default {
        name: 'MuePage',

        props: {
            headerHeight: {type: Number, default: 40},
            footerHeight: {type: Number, default: 50}
        },

        computed: {
            hheight(){
                return this.$slots.header ? `${Math.max(0, this.headerHeight) || 0}px` : "0px";
            },
            fheight(){
                return this.$slots.footer ? `${Math.max(0, this.footerHeight) || 0}px` : "0px";
            },
            cheight(){
                return `calc(100% - ${this.hheight} - ${this.fheight})`;
            }
        }
    };
</script>
