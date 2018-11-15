<template>
    <header class="mue-header" :style="{ height }">
        <slot></slot>
    </header>
</template>

<script>
    export default {
        name: 'MueHeader',

        props: {
            height: {
                type: String,
                default: '40px'
            }
        }
    };
</script>
