<template>
    <colgroup>
        <col v-for="(c, i) in columns" :key="i" :width="c.width"/>
    </colgroup>
</template>
<script>
    export default {
        props: {
            columns: {type: Array, default: []},
            fixed: {type: Boolean, default: false},
            filter: {type: Boolean, default: false}
        }
    };
</script>
