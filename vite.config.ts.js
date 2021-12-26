// vite.config.ts
import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import WindiCSS from 'vite-plugin-windicss'
import { VitePWA } from 'vite-plugin-pwa'
import VueI18n from '@intlify/vite-plugin-vue-i18n'
import Inspect from 'vite-plugin-inspect'

// plugin/index.ts
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeFormat from 'rehype-format'
const rehypeVueify = function(config) {
  const fileHeader = (config == null ? void 0 : config.resolveRender) || `
  const _resolveRender = typeof resolveRender === 'function'
    ? resolveRender
    : ({ type, tagName }) => tagName || type;
  `
  const compiler = (node) => {
    const child = node.children
    const subCode = Array.isArray(child)
      ? `
        /** children render **/
      , [${child.map(n => compiler(n, {})).join(',\n')}]`
      : ''
    const code = ` h(_resolveRender(node), ${JSON.stringify(node, null, 2)}) ${subCode}`
    if (node.type === 'root') {
      return `
      import { h } from 'vue';
      ${fileHeader}

      export default {
        render() {
          return ${code}
        }
      }
      `
    }
    return code
  }
  Object.assign(this, { Compiler: compiler })
}
const VitePluginMark = () => {
  const processer = unified().use(remarkParse).use(remarkRehype).use(rehypeFormat).use(rehypeVueify)
  return {
    name: 'vite-plugin-md',
    enforce: 'pre',
    transform(raw, id) {
      if (!/\.md$/.test(id))
        return
      try {
        return processer.processSync(raw)
      }
      catch (e) {
        this.error(e)
      }
    },
  }
}

// vite.config.ts
const markdownWrapperClasses = 'prose prose-sm m-auto text-left'
const vite_config_default = defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve('C:\\Users\\charl\\Documents\\mark', 'src')}/`,
    },
  },
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),
    Pages({
      extensions: ['vue', 'md'],
    }),
    Layouts(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'vue-i18n',
        '@vueuse/head',
        '@vueuse/core',
      ],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      extensions: ['vue', 'md'],
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        IconsResolver({
          componentPrefix: '',
        }),
      ],
      dts: 'src/components.d.ts',
    }),
    Icons({
      autoInstall: true,
    }),
    WindiCSS({
      safelist: markdownWrapperClasses,
    }),
    VitePluginMark(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'safari-pinned-tab.svg'],
      manifest: {
        name: 'Vitesse',
        short_name: 'Vitesse',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      include: [path.resolve('C:\\Users\\charl\\Documents\\mark', 'locales/**')],
    }),
    Inspect({
      enabled: false,
    }),
  ],
  server: {
    fs: {
      strict: true,
    },
  },
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@vueuse/core',
      '@vueuse/head',
    ],
    exclude: [
      'vue-demi',
    ],
  },
})
export {
  vite_config_default as default,
}
// # sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGx1Z2luL2luZGV4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgVnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcclxuaW1wb3J0IFBhZ2VzIGZyb20gJ3ZpdGUtcGx1Z2luLXBhZ2VzJ1xyXG5pbXBvcnQgTGF5b3V0cyBmcm9tICd2aXRlLXBsdWdpbi12dWUtbGF5b3V0cydcclxuaW1wb3J0IEljb25zIGZyb20gJ3VucGx1Z2luLWljb25zL3ZpdGUnXHJcbmltcG9ydCBJY29uc1Jlc29sdmVyIGZyb20gJ3VucGx1Z2luLWljb25zL3Jlc29sdmVyJ1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJ1xyXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJ1xyXG4vLyBpbXBvcnQgTWFya2Rvd24gZnJvbSAndml0ZS1wbHVnaW4tbWQnXHJcbmltcG9ydCBXaW5kaUNTUyBmcm9tICd2aXRlLXBsdWdpbi13aW5kaWNzcydcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSdcclxuaW1wb3J0IFZ1ZUkxOG4gZnJvbSAnQGludGxpZnkvdml0ZS1wbHVnaW4tdnVlLWkxOG4nXHJcbmltcG9ydCBJbnNwZWN0IGZyb20gJ3ZpdGUtcGx1Z2luLWluc3BlY3QnXHJcbi8vIGltcG9ydCBQcmlzbSBmcm9tICdtYXJrZG93bi1pdC1wcmlzbSdcclxuLy8gaW1wb3J0IExpbmtBdHRyaWJ1dGVzIGZyb20gJ21hcmtkb3duLWl0LWxpbmstYXR0cmlidXRlcydcclxuaW1wb3J0IHsgVml0ZVBsdWdpbk1hcmsgfSBmcm9tICcuL3BsdWdpbi9pbmRleCdcclxuXHJcbmNvbnN0IG1hcmtkb3duV3JhcHBlckNsYXNzZXMgPSAncHJvc2UgcHJvc2Utc20gbS1hdXRvIHRleHQtbGVmdCdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ34vJzogYCR7cGF0aC5yZXNvbHZlKFwiQzpcXFxcVXNlcnNcXFxcY2hhcmxcXFxcRG9jdW1lbnRzXFxcXG1hcmtcIiwgJ3NyYycpfS9gLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIFZ1ZSh7XHJcbiAgICAgIGluY2x1ZGU6IFsvXFwudnVlJC8sIC9cXC5tZCQvXSxcclxuICAgIH0pLFxyXG5cclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9oYW5ub2VydS92aXRlLXBsdWdpbi1wYWdlc1xyXG4gICAgUGFnZXMoe1xyXG4gICAgICBleHRlbnNpb25zOiBbJ3Z1ZScsICdtZCddLFxyXG4gICAgfSksXHJcblxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL0pvaG5DYW1waW9uSnIvdml0ZS1wbHVnaW4tdnVlLWxheW91dHNcclxuICAgIExheW91dHMoKSxcclxuXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW50ZnUvdW5wbHVnaW4tYXV0by1pbXBvcnRcclxuICAgIEF1dG9JbXBvcnQoe1xyXG4gICAgICBpbXBvcnRzOiBbXHJcbiAgICAgICAgJ3Z1ZScsXHJcbiAgICAgICAgJ3Z1ZS1yb3V0ZXInLFxyXG4gICAgICAgICd2dWUtaTE4bicsXHJcbiAgICAgICAgJ0B2dWV1c2UvaGVhZCcsXHJcbiAgICAgICAgJ0B2dWV1c2UvY29yZScsXHJcbiAgICAgIF0sXHJcbiAgICAgIGR0czogJ3NyYy9hdXRvLWltcG9ydHMuZC50cycsXHJcbiAgICB9KSxcclxuXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW50ZnUvdW5wbHVnaW4tdnVlLWNvbXBvbmVudHNcclxuICAgIENvbXBvbmVudHMoe1xyXG4gICAgICAvLyBhbGxvdyBhdXRvIGxvYWQgbWFya2Rvd24gY29tcG9uZW50cyB1bmRlciBgLi9zcmMvY29tcG9uZW50cy9gXHJcbiAgICAgIGV4dGVuc2lvbnM6IFsndnVlJywgJ21kJ10sXHJcblxyXG4gICAgICAvLyBhbGxvdyBhdXRvIGltcG9ydCBhbmQgcmVnaXN0ZXIgY29tcG9uZW50cyB1c2VkIGluIG1hcmtkb3duXHJcbiAgICAgIGluY2x1ZGU6IFsvXFwudnVlJC8sIC9cXC52dWVcXD92dWUvLCAvXFwubWQkL10sXHJcblxyXG4gICAgICAvLyBjdXN0b20gcmVzb2x2ZXJzXHJcbiAgICAgIHJlc29sdmVyczogW1xyXG4gICAgICAgIC8vIGF1dG8gaW1wb3J0IGljb25zXHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FudGZ1L3VucGx1Z2luLWljb25zXHJcbiAgICAgICAgSWNvbnNSZXNvbHZlcih7XHJcbiAgICAgICAgICBjb21wb25lbnRQcmVmaXg6ICcnLFxyXG4gICAgICAgICAgLy8gZW5hYmxlZENvbGxlY3Rpb25zOiBbJ2NhcmJvbiddXHJcbiAgICAgICAgfSksXHJcbiAgICAgIF0sXHJcblxyXG4gICAgICBkdHM6ICdzcmMvY29tcG9uZW50cy5kLnRzJyxcclxuICAgIH0pLFxyXG5cclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRmdS91bnBsdWdpbi1pY29uc1xyXG4gICAgSWNvbnMoe1xyXG4gICAgICBhdXRvSW5zdGFsbDogdHJ1ZSxcclxuICAgIH0pLFxyXG5cclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRmdS92aXRlLXBsdWdpbi13aW5kaWNzc1xyXG4gICAgV2luZGlDU1Moe1xyXG4gICAgICBzYWZlbGlzdDogbWFya2Rvd25XcmFwcGVyQ2xhc3NlcyxcclxuICAgIH0pLFxyXG4gICAgVml0ZVBsdWdpbk1hcmsoKSxcclxuXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW50ZnUvdml0ZS1wbHVnaW4tbWRcclxuICAgIC8vIERvbid0IG5lZWQgdGhpcz8gVHJ5IHZpdGVzc2UtbGl0ZTogaHR0cHM6Ly9naXRodWIuY29tL2FudGZ1L3ZpdGVzc2UtbGl0ZVxyXG4gICAgLy8gTWFya2Rvd24oe1xyXG4gICAgLy8gICB3cmFwcGVyQ2xhc3NlczogbWFya2Rvd25XcmFwcGVyQ2xhc3NlcyxcclxuICAgIC8vICAgaGVhZEVuYWJsZWQ6IHRydWUsXHJcbiAgICAvLyAgIG1hcmtkb3duSXRTZXR1cChtZCkge1xyXG4gICAgLy8gICAgIC8vIGh0dHBzOi8vcHJpc21qcy5jb20vXHJcbiAgICAvLyAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0eXBlcyBtaXNtYXRjaFxyXG4gICAgLy8gICAgIG1kLnVzZShQcmlzbSlcclxuICAgIC8vICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHR5cGVzIG1pc21hdGNoXHJcbiAgICAvLyAgICAgbWQudXNlKExpbmtBdHRyaWJ1dGVzLCB7XHJcbiAgICAvLyAgICAgICBwYXR0ZXJuOiAvXmh0dHBzPzpcXC9cXC8vLFxyXG4gICAgLy8gICAgICAgYXR0cnM6IHtcclxuICAgIC8vICAgICAgICAgdGFyZ2V0OiAnX2JsYW5rJyxcclxuICAgIC8vICAgICAgICAgcmVsOiAnbm9vcGVuZXInLFxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICB9KVxyXG4gICAgLy8gICB9LFxyXG4gICAgLy8gfSksXHJcblxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FudGZ1L3ZpdGUtcGx1Z2luLXB3YVxyXG4gICAgVml0ZVBXQSh7XHJcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxyXG4gICAgICBpbmNsdWRlQXNzZXRzOiBbJ2Zhdmljb24uc3ZnJywgJ3JvYm90cy50eHQnLCAnc2FmYXJpLXBpbm5lZC10YWIuc3ZnJ10sXHJcbiAgICAgIG1hbmlmZXN0OiB7XHJcbiAgICAgICAgbmFtZTogJ1ZpdGVzc2UnLFxyXG4gICAgICAgIHNob3J0X25hbWU6ICdWaXRlc3NlJyxcclxuICAgICAgICB0aGVtZV9jb2xvcjogJyNmZmZmZmYnLFxyXG4gICAgICAgIGljb25zOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9wd2EtMTkyeDE5Mi5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9wd2EtNTEyeDUxMi5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9wd2EtNTEyeDUxMi5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgICAgICAgcHVycG9zZTogJ2FueSBtYXNrYWJsZScsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vaW50bGlmeS9idW5kbGUtdG9vbHMvdHJlZS9tYWluL3BhY2thZ2VzL3ZpdGUtcGx1Z2luLXZ1ZS1pMThuXHJcbiAgICBWdWVJMThuKHtcclxuICAgICAgcnVudGltZU9ubHk6IHRydWUsXHJcbiAgICAgIGNvbXBvc2l0aW9uT25seTogdHJ1ZSxcclxuICAgICAgaW5jbHVkZTogW3BhdGgucmVzb2x2ZShcIkM6XFxcXFVzZXJzXFxcXGNoYXJsXFxcXERvY3VtZW50c1xcXFxtYXJrXCIsICdsb2NhbGVzLyoqJyldLFxyXG4gICAgfSksXHJcblxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FudGZ1L3ZpdGUtcGx1Z2luLWluc3BlY3RcclxuICAgIEluc3BlY3Qoe1xyXG4gICAgICAvLyBjaGFuZ2UgdGhpcyB0byBlbmFibGUgaW5zcGVjdCBmb3IgZGVidWdnaW5nXHJcbiAgICAgIGVuYWJsZWQ6IGZhbHNlLFxyXG4gICAgfSksXHJcbiAgXSxcclxuXHJcbiAgc2VydmVyOiB7XHJcbiAgICBmczoge1xyXG4gICAgICBzdHJpY3Q6IHRydWUsXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRmdS92aXRlLXNzZ1xyXG4gIHNzZ09wdGlvbnM6IHtcclxuICAgIHNjcmlwdDogJ2FzeW5jJyxcclxuICAgIGZvcm1hdHRpbmc6ICdtaW5pZnknLFxyXG4gIH0sXHJcblxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgaW5jbHVkZTogW1xyXG4gICAgICAndnVlJyxcclxuICAgICAgJ3Z1ZS1yb3V0ZXInLFxyXG4gICAgICAnQHZ1ZXVzZS9jb3JlJyxcclxuICAgICAgJ0B2dWV1c2UvaGVhZCcsXHJcbiAgICBdLFxyXG4gICAgZXhjbHVkZTogW1xyXG4gICAgICAndnVlLWRlbWknLFxyXG4gICAgXSxcclxuICB9LFxyXG59KVxyXG4iLCAiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4vLyBpbXBvcnQgZnMgZnJvbSAnZnMnXG4vLyBpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgdW5pZmllZCB9IGZyb20gJ3VuaWZpZWQnXG5pbXBvcnQgdHlwZSB7IFJvb3QgfSBmcm9tICdoYXN0J1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIENvbXBpbGVyRnVuY3Rpb24gfSBmcm9tICd1bmlmaWVkJ1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4gYXMgVml0ZVBsdWdpbiB9IGZyb20gJ3ZpdGUnXG4vLyBpbXBvcnQgeyBjcmVhdGVGaWx0ZXIgfSBmcm9tICdAcm9sbHVwL3BsdWdpbnV0aWxzJ1xuLy8gaW1wb3J0IHsgY3JlYXRlTWFya2Rvd24gfSBmcm9tICcuL21hcmtkb3duJ1xuLy8gaW1wb3J0IHsgcmVzb2x2ZU9wdGlvbnMgfSBmcm9tICcuL29wdGlvbnMnXG4vLyBpbXBvcnQgdHlwZSB7IE9wdGlvbnMgfSBmcm9tICcuL3R5cGVzJ1xuaW1wb3J0IHJlbWFya1BhcnNlIGZyb20gJ3JlbWFyay1wYXJzZSdcbmltcG9ydCByZW1hcmtSZWh5cGUgZnJvbSAncmVtYXJrLXJlaHlwZSdcbi8vIGltcG9ydCByZW1hcmtTaGlraVR3b3NsYXNoIGZyb20gJ3JlbWFyay1zaGlraS10d29zbGFzaCdcbmltcG9ydCByZWh5cGVGb3JtYXQgZnJvbSAncmVoeXBlLWZvcm1hdCdcbi8vIGltcG9ydCByZWh5cGVTdHJpbmdpZnkgZnJvbSAncmVoeXBlLXN0cmluZ2lmeSdcblxudHlwZSBOb2RlID0gUm9vdHxSb290WydjaGlsZHJlbiddW251bWJlcl1cblxuZXhwb3J0IHR5cGUgT3B0aW9ucyA9IHtcbiAgcmVzb2x2ZVJlbmRlcjogc3RyaW5nXG59XG4vLyBjb25zdCBtZHggPSBmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKFwiQzpcXFxcVXNlcnNcXFxcY2hhcmxcXFxcRG9jdW1lbnRzXFxcXG1hcmtcXFxccGx1Z2luXCIsICcuL3R3by5tZCcpLCAndXRmLTgnKVxuXG5jb25zdCByZWh5cGVWdWVpZnk6IFBsdWdpbiA9IGZ1bmN0aW9uKGNvbmZpZzogT3B0aW9ucykge1xuICBjb25zdCBmaWxlSGVhZGVyID0gY29uZmlnPy5yZXNvbHZlUmVuZGVyIHx8IGBcbiAgY29uc3QgX3Jlc29sdmVSZW5kZXIgPSB0eXBlb2YgcmVzb2x2ZVJlbmRlciA9PT0gJ2Z1bmN0aW9uJ1xuICAgID8gcmVzb2x2ZVJlbmRlclxuICAgIDogKHsgdHlwZSwgdGFnTmFtZSB9KSA9PiB0YWdOYW1lIHx8IHR5cGU7XG4gIGBcbiAgY29uc3QgY29tcGlsZXI6IENvbXBpbGVyRnVuY3Rpb248Tm9kZSwgc3RyaW5nPiA9IChub2RlKSA9PiB7XG4gICAgY29uc3QgY2hpbGQgPSAobm9kZSBhcyBhbnkpLmNoaWxkcmVuXG4gICAgY29uc3Qgc3ViQ29kZSA9IEFycmF5LmlzQXJyYXkoY2hpbGQpXG4gICAgICA/IGBcbiAgICAgICAgLyoqIGNoaWxkcmVuIHJlbmRlciAqKi9cbiAgICAgICwgWyR7Y2hpbGQubWFwKG4gPT4gY29tcGlsZXIobiwge30gYXMgYW55KSkuam9pbignLFxcbicpfV1gXG4gICAgICA6ICcnXG5cbiAgICBjb25zdCBjb2RlID0gYCBoKF9yZXNvbHZlUmVuZGVyKG5vZGUpLCAke0pTT04uc3RyaW5naWZ5KG5vZGUsIG51bGwsIDIpfSkgJHtzdWJDb2RlfWBcbiAgICBpZiAobm9kZS50eXBlID09PSAncm9vdCcpIHtcbiAgICAgIHJldHVybiBgXG4gICAgICBpbXBvcnQgeyBoIH0gZnJvbSAndnVlJztcbiAgICAgICR7ZmlsZUhlYWRlcn1cXG5cbiAgICAgIGV4cG9ydCBkZWZhdWx0IHtcbiAgICAgICAgcmVuZGVyKCkge1xuICAgICAgICAgIHJldHVybiAke2NvZGV9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGBcbiAgICB9XG5cbiAgICByZXR1cm4gY29kZVxuICB9XG5cbiAgT2JqZWN0LmFzc2lnbih0aGlzLCB7IENvbXBpbGVyOiBjb21waWxlciB9KVxufVxuXG4vLyBjb25zdCBydW4gPSBhc3luYygpID0+IHtcbi8vIGNvbnN0IGZpbGUgPSBhd2FpdCB1bmlmaWVkKClcbi8vICAgLnVzZShyZW1hcmtQYXJzZSlcbi8vICAgLnVzZShyZW1hcmtSZWh5cGUpXG4vLyAvLyAudXNlKHJlaHlwZURvY3VtZW50KVxuLy8gICAudXNlKHJlaHlwZUZvcm1hdClcbi8vICAgLnVzZShyZWh5cGVWdWVpZnkpXG4vLyAudXNlKHJlaHlwZVN0cmluZ2lmeSlcbi8vIC5wcm9jZXNzKG1keClcblxuLy8gICAvLyBjb25zb2xlLmxvZyhmaWxlLnZhbHVlKVxuLy8gfVxuXG4vLyBydW4oKVxuXG5leHBvcnQgY29uc3QgVml0ZVBsdWdpbk1hcmsgPSAoKSA9PiB7XG4gIGNvbnN0IHByb2Nlc3NlciA9IHVuaWZpZWQoKVxuICAgIC51c2UocmVtYXJrUGFyc2UpXG4gICAgLnVzZShyZW1hcmtSZWh5cGUpXG4gIC8vIC51c2UocmVoeXBlRG9jdW1lbnQpXG4gICAgLnVzZShyZWh5cGVGb3JtYXQpXG4gICAgLnVzZShyZWh5cGVWdWVpZnkpXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3ZpdGUtcGx1Z2luLW1kJyxcbiAgICBlbmZvcmNlOiAncHJlJyxcbiAgICB0cmFuc2Zvcm0ocmF3OiBzdHJpbmcsIGlkOiBzdHJpbmcpIHtcbiAgICAgIGlmICghL1xcLm1kJC8udGVzdChpZCkpXG4gICAgICAgIHJldHVyblxuXG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gcHJvY2Vzc2VyLnByb2Nlc3NTeW5jKHJhdylcbiAgICAgICAgLy8gcmV0dXJuIG1hcmtkb3duVG9WdWUoaWQsIHJhdylcbiAgICAgIH1cbiAgICAgIGNhdGNoIChlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5lcnJvcihlKVxuICAgICAgfVxuICAgIH0sXG4gICAgLy8gYXN5bmMgaGFuZGxlSG90VXBkYXRlKGN0eCkge1xuICAgIC8vICAgaWYgKCFmaWx0ZXIoY3R4LmZpbGUpKVxuICAgIC8vICAgICByZXR1cm5cblxuICAgIC8vICAgY29uc3QgZGVmYXVsdFJlYWQgPSBjdHgucmVhZFxuICAgIC8vICAgY3R4LnJlYWQgPSBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgcmV0dXJuIG1hcmtkb3duVG9WdWUoY3R4LmZpbGUsIGF3YWl0IGRlZmF1bHRSZWFkKCkpXG4gICAgLy8gICB9XG4gICAgLy8gfSxcbiAgfSBhcyBWaXRlUGx1Z2luXG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7OztBQ1RBO0FBUUE7QUFDQTtBQUVBO0FBVUEsSUFBTSxlQUF1QixTQUFTLFFBQWlCO0FBQ3JELFFBQU0sYUFBYSxrQ0FBUSxrQkFB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
