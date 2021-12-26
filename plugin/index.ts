/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import fs from 'fs'
import path from 'path'
import type { Root, Element } from 'hast'
import type { Plugin, CompilerFunction } from 'unified'
import type { Plugin as VitePlugin } from 'vite'

const cacheCD = path.resolve(process.cwd(), './.cache', '.livingmark')

const writeCacheFile = (filename: string, content: string) => {
  if (!fs.existsSync(cacheCD))
    fs.mkdirSync(cacheCD, { recursive: true })
  fs.writeFileSync(path.resolve(cacheCD, filename), content, 'utf-8')
}

type Node = Root|Root['children'][number]

export type Options = {
  resolveRender: string
  ref: any
  highlighter: any
}

const rehypeVueify: Plugin = function(config: Options) {
  const ref = config.ref
  let democount = 0
  let fileHeader = config?.resolveRender || `
      const _resolveRender = ({ type, tagName }: any) => tagName || type;
      const stringify = (s: string) => s
        .replace(/__SCRIPT__/g, 'script')
        .replace(/__TEMPLATE__/g, 'template')
        .replace(/__LL__/g, '{{')
        .replace(/__RR__/g, '}}')
      `

  const safe = (s: string) => {
    return s
      ? `stringify(${JSON.stringify(s)
        .replace(/script/g, '__SCRIPT__')
        .replace(/template/g, '__TEMPLATE__')
        .replace(/{{/g, '__LL__')
        .replace(/}}/g, '__RR__')
      })`
      : s
  }
  const compiler: CompilerFunction<Node, string> = (node) => {
    let code = safe((node as any).value)
    // console.log('node.type', node.type, JSON.stringify(node, null, 2))

    if (node.type === 'element') {
      const child = node.children
      const subCode = Array.isArray(child)
        ? `, [${child.map(n => compiler(n, {} as any)).join(',\n')}]`
        : ''

      const liteNode = { ...node, children: undefined }
      code = `
          h(_resolveRender(${JSON.stringify(liteNode, null, 2)}),
          ${JSON.stringify(node.properties, null, 2)}
          ${subCode})
      `
      if (node.tagName === 'pre') {
        const maybeCode = node.children[0] as Element
        if (maybeCode) {
          const isCodePre = maybeCode.tagName === 'code'
          const classList = (maybeCode?.properties?.className || []) as string[]
          const langclass = classList.find(x => x.startsWith('language'))
          const codeMeta = isCodePre ? maybeCode.data?.meta as string || '' : ''
          const codeLang = langclass?.replace('language-', '') || 'bash'
          const codeTxt = (maybeCode?.children?.[0] as any)?.value
          // console.log(JSON.stringify(maybeCode, null, 2))
          const isCodeAlive = codeMeta?.includes('live')
          // TODO: 高亮
          // const hilight = codeTxt
          code = `h('pre', {}, [h('code', ${JSON.stringify(maybeCode.properties)}, [${safe(codeTxt)}])])`
          if (isCodeAlive) {
            const demoId = `demo${democount++}`
            ref.current[demoId] = codeTxt
            fileHeader = `import ${demoId} from '@livingmark/${demoId}.${codeLang}'; ${fileHeader}`

            writeCacheFile(`${demoId}.${codeLang}`, codeTxt)

            code = `h('div', { class: 'living-code' }, [
                h('div', { class: 'livingcode' }, [ h(${demoId}, {}, []) ]),
                ${code},
              ])`
          }
        }
      }
      //   if (node.tagName === 'code') {
      //     // console.log('---------------------')
      //     // console.log(JSON.stringify(node, null, 2))
      //     // console.log('---------------------')
      //     const classList = (node?.properties?.className || []) as string[]
      //     const langclass = classList.find(x => x.startsWith('language'))
      //     const lang = langclass?.replace('language-', '')

      //     const { meta = '' } = (node.data || {}) as any
      //     if (meta.includes('live')) {
      //       const demoId = `demo${democount++}`
      //       const sourceCode = (node.children[0] as any).value
      //       ref.current[demoId] = sourceCode
      //       fileHeader = `import ${demoId} from '@livingmark/${demoId}.${lang}'; ${fileHeader}`

      //       writeCacheFile(`${demoId}.${lang}`, sourceCode)

    //       code = `h('div', { class: 'livingmark-preview' }, [
    //           h('div', { class: 'livingcode' }, [ h(${demoId}, {}, []) ]),
    //           h('pre', { class: 'sourcecode' }, [ ${code} ]),
    //         ])`
    //     }
    //   }
    }

    if (node.type === 'root') {
      const child = node.children
      const subCode = Array.isArray(child)
        ? `[${child.map(n => compiler(n, {} as any)).join(',\n')}]`
        : ''

      const body = `h('div', { class: 'markdown' }, ${subCode});`
      return `
        <template>
          <div class="markdown text-left" >
            <vuemd />
          </div>
        </template>
        <script lang="ts">
          import { h } from 'vue';
          ${fileHeader}\n
          export default {
            components: {
              vuemd: {
                render() {
                  return ${body}
                }
              }
            }
          }
        </script>
      `
    }

    return code
  }

  Object.assign(this, { Compiler: compiler })
}

// const run = async() => {
// const file = await unified()
//   .use(remarkParse)
//   .use(remarkRehype)
// // .use(rehypeDocument)
//   .use(rehypeFormat)
//   .use(rehypeVueify)
// .use(rehypeStringify)
// .process(mdx)

//   // console.log(file.value)
// }

// run()

export const VitePluginMark = () => {
  const memo = {
    processer: null as any,
    demos: {} as any,
  }

  const loader = async() => {
    const unified = await import('unified').then(mod => mod.unified)
    const remarkParse = await import('remark-parse').then(mod => mod.default)
    const remarkFrontmatter = await import('remark-frontmatter').then(mod => mod.default)
    const remarkRehype = await import('remark-rehype').then(mod => mod.default)
    const pipeline = unified()
      .use(remarkParse)
      .use(remarkFrontmatter)
      .use(remarkRehype)
    // .use(rehypeDocument)
    // .use(rehypeFormat)
      .use([[rehypeVueify, { ref: { current: memo.demos } }]])
    return pipeline
  }
  loader().then((p) => {
    memo.processer = p
  })

  const virtualModulePrefix = 'livingmark'
  const resolvedVirtualModuleIdPrefix = `\0${virtualModulePrefix}`
  return [{
    name: 'vite:livingmark-transformer',
    enforce: 'pre',
    config() {
      return {
        resolve: {
          alias: {
            '@livingmark/': `${cacheCD}/`,
          },
        },
      }
    },
    // async load(id) {
    //   if (/livingmark/.test(id)) {
    //     const key = id
    //       .replace(`${resolvedVirtualModuleIdPrefix}/`, '')
    //       .replace(/\..*$/, '')
    //     const code = memo.demos[key] || ''
    //     // const ret = await vitevueplugin.transform.bind(this)(code, id)
    //     // console.log({ id, vitevueplugin, demos: memo.demos, code, key, ret })
    //     return code
    //   }
    // },
    transform(raw: string, id: string) {
      if (/\.md$/.test(id)) {
        try {
          const vfile = memo.processer.processSync(raw)
          const code = vfile.value

          // fs.writeFileSync(path.resolve(__dirname, './code.vue'), code, 'utf-8')

          return code
        // return markdownToVue(id, raw)
        }
        catch (e: any) {
          this.error(e)
        }
      }
    },
    async handleHotUpdate(ctx) {
      if (!/\.md$/.test(ctx.file))
        return

      const defaultRead = ctx.read
      ctx.read = async function() {
        const vfile = memo.processer.processSync(await defaultRead())
        return vfile.value
        // (ctx.file, await defaultRead())
      }
    },
  } as VitePlugin,
  {
    name: 'vite:livingmark-vfilesystem',
    enforce: 'pre',
    // config() {
    //   return {
    //     alias: {
    //       '@livingmark': cacheCD,
    //     },
    //   }
    // },
    // resolveId(id) {
    //   if (/@livingmark/.test(id))
    //     return `\0${id}`
    // },
    // load(id) {
    //   if (/@livingmark/.test(id)) {
    //     const key = id
    //       .replace(`${resolvedVirtualModuleIdPrefix}/`, '')
    //       .replace(/\..*$/, '')
    //     console.log({ key, id, demos: memo.demos })
    //     const code = memo.demos[key] || ''
    //     return code
    //   }
    // },
    // transform(raw: string, id: string) {
    //   if (/^livingmark/.test(id)) {
    //     try {
    //       const code = vueplugin.transform()
    //       return code
    //     }
    //     catch (e: any) {
    //       this.error(e)
    //     }
    //   }
    // },
  } as VitePlugin,
  ]
}
