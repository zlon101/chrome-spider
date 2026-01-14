# Chrome 网页数据抓取器 - 项目概览

## 📁 项目结构

```
chrome-spider/
├── manifest.json              # Chrome 扩展配置文件（Manifest V3）
├── popup.html                 # 扩展弹出窗口页面
├── popup.css                  # 弹出窗口样式
├── popup.js                   # 弹出窗口逻辑
├── content.js                 # 内容脚本（页面数据抓取核心逻辑）
├── background.js              # 后台服务工作进程
├── icons/                     # 图标文件夹
│   ├── icon.svg              # SVG 源图标
│   ├── ICON_GUIDE.md         # 图标生成指南
│   ├── icon16.png            # 16x16 图标（需生成）
│   ├── icon48.png            # 48x48 图标（需生成）
│   └── icon128.png           # 128x128 图标（需生成）
├── generate-icons.html        # 在线图标生成工具
├── test-normal-page.html      # 普通页面测试页
├── test-list-page.html        # 列表页面测试页
├── QUICK_START.md            # 快速入门指南
└── README.md                 # 完整文档
```

## ✨ 核心功能

### 1. 普通页面抓取
- **配置格式**：JSON 对象，键为字段名，值为 CSS 选择器
- **支持功能**：
  - ✅ 文本内容提取
  - ✅ 元素属性提取（使用 `@属性名` 语法）
  - ✅ 实时结果显示
  - ✅ 一键复制结果

### 2. 列表页面抓取
- **配置格式**：包含翻页按钮、最大页数和字段配置的 JSON 对象
- **支持功能**：
  - ✅ 自动翻页
  - ✅ 多页数据聚合
  - ✅ 进度实时显示
  - ✅ JSON 文件导出
  - ✅ 配置自动保存

## 🚀 快速开始

### 第一步：生成图标（必需）

**选项 A - 使用内置工具**：
```bash
# 在浏览器中打开
open generate-icons.html
# 点击"下载所有图标"，然后移动文件到 icons/ 文件夹
```

**选项 B - 使用在线工具**：
访问 https://www.favicon-generator.org/ 上传 `icons/icon.svg`

### 第二步：安装扩展

1. 打开 Chrome：`chrome://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目文件夹

### 第三步：测试功能

```bash
# 测试普通页面
open test-normal-page.html

# 测试列表页面
open test-list-page.html
```

## 📝 使用示例

### 普通页面配置示例

```json
{
  "标题": "h1.title",
  "作者": "span.author",
  "日期": "time.publish-date",
  "内容": "article.content",
  "链接": "a.read-more@href",
  "图片": "img.cover@src"
}
```

### 列表页面配置示例

```json
{
  "container": ".product-item",
  "next_button": "a.pagination-next",
  "max_page": 5,
  "field": {
    "商品名称": ".product-title",
    "价格": ".product-price",
    "评分": ".product-rating",
    "详情链接": ".product-link@href",
    "图片": ".product-image@src"
  }
}
```

## 🔧 技术特点

- **Manifest V3**：符合 Chrome 最新扩展规范
- **零依赖**：纯 JavaScript 实现，无需任何外部库
- **响应式设计**：美观的用户界面
- **数据持久化**：自动保存配置
- **错误处理**：完善的异常捕获和提示

## 📋 CSS 选择器速查

| 选择器类型 | 示例 | 说明 |
|----------|------|------|
| 类选择器 | `.title` | 选择 class="title" 的元素 |
| ID 选择器 | `#main` | 选择 id="main" 的元素 |
| 标签选择器 | `h1` | 选择所有 h1 元素 |
| 后代选择器 | `.container .item` | 选择 .container 内的 .item |
| 子选择器 | `.parent > .child` | 选择 .parent 的直接子元素 |
| 属性选择器 | `a[href]` | 选择有 href 属性的 a 元素 |
| 伪类选择器 | `li:first-child` | 选择第一个 li 元素 |
| 获取属性 | `a@href` | 获取 a 元素的 href 属性值 |

## ⚠️ 注意事项

1. **遵守法律法规**：仅抓取您有权访问的数据
2. **尊重网站规则**：查看并遵守 robots.txt 和服务条款
3. **合理使用频率**：避免给服务器造成负担
4. **数据隐私**：所有数据仅存储在本地
5. **版权意识**：抓取的数据请勿用于商业用途

## 🐛 常见问题排查

### 问题：抓取不到数据
**解决方案**：
- 在浏览器控制台测试选择器：`document.querySelector('你的选择器')`
- 确认页面已完全加载
- 检查元素是否在 iframe 中（暂不支持）

### 问题：列表抓取中断
**解决方案**：
- 验证"下一页"按钮选择器
- 检查按钮是否有 disabled 类
- 在 content.js 中增加等待时间

### 问题：获取不到属性值
**解决方案**：
- 确保使用 `@属性名` 语法
- 验证属性是否存在：在控制台运行 `element.getAttribute('属性名')`

## 📚 文档导航

- **快速开始**：查看 `QUICK_START.md`
- **完整文档**：查看 `README.md`
- **图标生成**：查看 `icons/ICON_GUIDE.md`

## 🎯 下一步计划

可能的扩展功能：
- [ ] 支持正则表达式提取
- [ ] 支持 XPath 选择器
- [ ] 数据过滤和转换
- [ ] 定时自动抓取
- [ ] 导出多种格式（CSV、Excel）
- [ ] iframe 内容抓取
- [ ] 分页策略优化
- [ ] 云端配置同步

## 📄 许可证

MIT License - 自由使用和修改

---

**作者**：Chrome Spider Team  
**版本**：v1.0.0  
**日期**：2026-01-14  
**支持**：Chrome 88+
