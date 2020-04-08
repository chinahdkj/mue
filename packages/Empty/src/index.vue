<template>
    <div class="mue-empty">
        <div class="mue-empty-img"></div>
        <div class="mue-empty-title">{{ t('mue.common.empty') }}</div>
    </div>
</template>

<script>
    import {localeMixin, t} from "../../../src/locale";
    export default {
        mixins: [localeMixin],
        name: "MueEmpty",
        props: {},
        data(){
            return {};
        },
        methods: {},
        components: {},
    }
</script>
