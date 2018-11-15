<template>
    <footer class="mue-footer" :style="{ height }">
        <slot></slot>
    </footer>
</template>

<script>
    export default {
        name: 'MueFooter',

        props: {
            height: {
                type: String,
                default: '50px'
            }
        }
    };
</script>
