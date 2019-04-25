<template>
    <div class="index"></div>
</template>

<script>
    export default {
        name: 'MueTree',
        props:{
            values: {type:Array, default(){
                return [];
                }},
            value: {type: String, default: ""},

            multiple: {type: Boolean, default:false}
        },
        // components: {panel},
        provide() {
            return {PICKER: this};
        },
    };
</script>
