# living code in markdown

---

使用 live 标记，让代码从 markdown 变活


`` ```vue `` *live*
```vue
<script setup lang="ts">
const a = '2';
const { t } = useI18n()
</script>

<template>
  <div>
    {{ t('intro.whats-your-name') }}
  </div>
</template>
```
`` ``` ``

---


```vue live
<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div>
    {{ t('intro.whats-your-name') }}
  </div>
</template>
```
