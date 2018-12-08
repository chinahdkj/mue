<template>
    <form class="mue-form">
        <slot></slot>
    </form>
</template>

<script>
    export default {
        name: "MueForm",
        components: {},
        props: {
            labelWidth: {type: Number, default: 90}
        },
        provide(){
            return {
                FORM: this
            };
        },
        data(){
            return {};
        },
        methods: {}
    }
</script>