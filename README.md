# 吴佳硕 · Personal Portfolio

暖灰纸色、编辑式大字、细线网格与原创三维水滴动效。原生 HTML / CSS / JavaScript，Node.js 构建，无第三方依赖。

## 本地运行

需要 Node.js 20 或以上，无需 npm install。

```sh
npm run dev
```

打开 http://localhost:4173 。修改源文件后运行 `npm run build` 并刷新浏览器。构建输出位于 `dist/`；不要直接修改生成的 HTML。

```sh
npm run build
npm run check
```

## 内容维护

- `src/data/projects.mjs`：所有项目、分类、角色、过程、结果与复盘。
- `src/data/site.mjs`：联系方式、账号链接、Now 页整理日期。
- `src/art.mjs`：原创项目示意图。
- `scripts/build.mjs`：页面结构、About 与 Now 文案。
- `public/assets/style.css` / `editorial.css`：基础样式、字体、网格与响应式。
- `public/assets/app.js`：菜单、筛选、搜索与复制账号功能。
- `public/assets/motion.js`：持久水滴、站内过渡、涟漪交互、暂停与内容编排。左下角可暂停动效。
- `public/assets/camera-director.js`：根据阅读阶段计算统一镜头，不使用分散的小球或卡片逐点路径。
- `public/assets/prism-water.js`：当前珠光水滴材质、局部压陷、曲面涟漪与反射高光。
- `public/assets/chapters.css` / `scenes.css`：章节构图、上升内容群、彩色十字收尾与反色光标。
- `public/assets/fonts/`：自托管 Syne / Space Grotesk 可变字体和许可证。

新增项目：在 projects 数组里添加对象，slug 唯一。首页与 Work 页的精选顺序由 `scripts/build.mjs` 的 `selectedOrder` 管理，优先展示 Listing Agent、Web 工具与有成果反馈的内容实践；所有项目自动生成案例页与档案条目。不确定的项目年份使用 `null`，不要推测。

真实封面：把图片存到 `public/assets/`，在项目中设置 `image: { src: '/assets/filename.webp', alt: '具体的图片描述', caption: '图片来源或说明' }`。`gallery` 接受同样格式的对象数组。没有真实图片时显示明确标注的项目示意，不把它当成原始作品。`link` 可以填公开演示链接；未填不生成按钮。

电话与邮箱由本人提供，联系页分别使用 tel 与 mailto 链接。公开账号只保留红果装备档案；其主页链接尚未提供。GitHub 个人主页已链接。可在 site.mjs 继续维护。

## 部署

可部署到任何支持目录 index.html 的静态托管。构建命令 `npm run build`，发布目录 `dist`，站点部署于域名根路径。无需服务器端运行 Node.js。

在托管平台配置真实 `SITE_URL` 环境变量后构建。该值应是含 https 的完整站点域名。构建器会自动生成绝对 canonical、Open Graph URL、sitemap.xml 和 robots.txt 中的 Sitemap 引用。不配置时按本地预览构建，不虚构域名。

GitHub Pages 使用 `.github/workflows/pages.yml` 自动发布：推送到 `main` 后，在 GitHub Actions 中用 `SITE_URL=https://wujiashuo1-debug.github.io` 构建并检查 `dist/`，然后发布到账号主页。仓库 Settings → Pages 的 Source 需设为 GitHub Actions。线上地址为 https://wujiashuo1-debug.github.io/ 。

`404.html` 已生成；应使用托管平台的静态 404 支持，而非 SPA 路由回退。未知地址应返回 404。公开上线前补齐 CONTENT-TODO.md 中的必要资料。

## SEO、性能与无障碍

每个页面独立 HTML、标题、描述与结构化数据；无远程字体、分析追踪或第三方网络请求。站内链接通过渐进增强保留画布并替换页面内容；直接访问和禁用 JavaScript 时仍使用完整静态 HTML。提供 1200×630 PNG 分享图、favicon、键盘焦点、跳转正文、搜索结果播报、可折叠菜单和减少动态效果支持。内容在 JS 禁用时仍可阅读，手机导航展开显示。

球体使用本地原生 WebGL，无库依赖；不支持 WebGL 时显示静态渐变。全站只有一个持久画布；首页按开场、右侧近景、作品前景、内容群展开编排，再由安静的成果阅读与彩色十字收尾接管。球体退出后停止绘制，其他页面继续复用同一画布。解析射线交点与曲面波导数减少着色开销；逐显示帧更新，响应按真实时间计算。后台页面停帧；绘制分辨率设有上限，持续慢帧时自动降低分辨率。鼠标圆环采用差值混合；触屏和暂停模式不显示跟随光标。

可选 `scripts/generate-og.py` 用 Pillow 重新生成分享图，平时构建不需要 Python 或 Pillow。

设计分析见 DESIGN.md；待补充素材见 CONTENT-TODO.md。
