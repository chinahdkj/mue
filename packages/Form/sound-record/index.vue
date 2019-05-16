<template>
    <div class="mue-sound-record">

    </div>
</template>

<script>
    export default {
        name: "MueSoundRecord",
        components: {},
        inject: {
            FORM_ITEM: {
                from: "FORM_ITEM",
                default(){
                    return {};
                }
            }
        },
        props: {
            value: {type: [String, Array], default: ""},
            disabled: {type: Boolean, default: false},
            multiple: {type: Boolean, default: false},
            local: {type: Boolean, default: false},
            limit: {type: Number, default: 5}
        },
        data(){
            return {};
        },
        methods: {}
    }
</script>