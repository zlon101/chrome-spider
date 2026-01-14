# 网页数据抓取器 Chrome 扩展

一个功能强大的 Chrome 扩展，支持普通页面和列表页面的数据抓取。

## 功能特性

### 1. 普通页面抓取
- 通过 CSS 选择器配置字段
- 支持获取文本内容和元素属性
- 实时显示抓取结果
- 一键复制结果到剪贴板

### 2. 列表页面抓取
- 自动翻页抓取多页数据
- **支持 `container` 配置确保数据准确**
- 可配置最大抓取页数
- 实时显示抓取进度
- 支持导出 JSON 文件
- 数据预览和复制功能

## 安装步骤

1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择本项目目录 `/Users/admin/work/chrome-spider`
5. 扩展安装完成！

## 使用说明

### 普通页面抓取

1. 打开需要抓取的网页
2. 点击浏览器工具栏中的扩展图标
3. 选择"普通页面"模式
4. 输入字段配置（JSON 格式）：

```json
{
  "姓名": "div.name",
  "年龄": "span.age",
  "邮箱": "a.email",
  "头像": "img.avatar@src"
}
```

5. 点击"开始抓取"按钮
6. 查看抓取结果，可以复制或进一步处理

**注意**：
- 键名为自定义的字段名
- 值为 CSS 选择器
- 使用 `@属性名` 获取元素属性值（如 `a@href` 获取链接地址）

### 列表页面抓取

1. 打开包含列表数据的网页
2. 点击扩展图标，选择"列表页面"模式
3. 输入列表配置：

```json
{
  "container": ".article-item",
  "next_button": "a.next-page",
  "max_page": 3,
  "field": {
    "标题": "h2.title",
    "摘要": "p.summary",
    "链接": "a.detail@href"
  }
}
```

4. 点击"开始抓取列表"
5. 等待抓取完成（会显示进度）
6. 下载 JSON 文件或复制结果

**配置说明**：
- `container`: 列表项容器的 CSS 选择器（**强烈推荐指定，确保抓取准确**）
- `next_button`: 下一页按钮的 CSS 选择器
- `max_page`: 最大抓取页数（默认 10）
- `field`: 字段配置对象，格式同普通页面

**⚠️ 重要提示**：
强烈建议在列表页面抓取时指定 `container` 配置，这能确保：
- 数据数量准确
- 字段对应关系正确
- 避免抓取到重复或错误的数据

详细说明请查看 **CONTAINER_GUIDE.md**

## CSS 选择器示例

```
// 类选择器
.title
div.content

// ID 选择器
#main
div#header

// 属性选择器
a[href]
input[type="text"]

// 后代选择器
.container .item
div p span

// 子选择器
.parent > .child

// 获取属性值
a.link@href
img@src
div@data-id
```

## 如何找到 container 选择器

1. 打开浏览器开发者工具（F12）
2. 点击左上角的"选择元素"工具
3. 点击列表中的某一项
4. 在 Elements 面板找到包含完整信息的容器元素
5. 右键 → Copy → Copy selector

在控制台验证：
```javascript
document.querySelectorAll('.article-item').length
// 应该返回页面上的列表项数量
```

## 配置自动保存

扩展会自动保存您的配置，下次打开时会自动加载上次使用的配置。

## 项目结构

```
chrome-spider/
├── manifest.json              # 扩展配置文件
├── popup.html                 # 弹出页面
├── popup.css                  # 样式文件
├── popup.js                   # 弹出页面逻辑
├── content.js                 # 内容脚本（页面抓取逻辑）
├── background.js              # 后台脚本
├── icons/                     # 图标文件夹
├── generate-icons.html        # 图标生成工具
├── test-normal-page.html      # 普通页面测试
├── test-list-page.html        # 列表页面测试
├── README.md                  # 使用文档
├── CONTAINER_GUIDE.md         # Container 配置指南
├── QUICK_START.md             # 快速入门
├── CHECKLIST.md               # 安装检查清单
├── CHANGELOG.md               # 更新日志
└── PROJECT_OVERVIEW.md        # 项目概览
```

## 图标文件说明

需要准备以下三个尺寸的图标：
- `icons/icon16.png` - 16x16 像素
- `icons/icon48.png` - 48x48 像素
- `icons/icon128.png` - 128x128 像素

使用 `generate-icons.html` 可以一键生成所有图标。

或者使用在线工具：
- https://www.favicon-generator.org/
- https://favicon.io/

## 技术栈

- Manifest V3（最新的 Chrome 扩展规范）
- 原生 JavaScript（无依赖）
- CSS3
- Chrome Extension APIs

## 注意事项

1. **尊重版权**：仅抓取您有权访问的数据
2. **遵守网站规则**：查看网站的 robots.txt 和服务条款
3. **合理使用**：不要过度频繁地抓取，避免给服务器造成压力
4. **数据安全**：抓取的数据仅存储在本地，请妥善保管

## 常见问题

### Q: 抓取不到数据怎么办？
A: 请检查：
- CSS 选择器是否正确（可以在浏览器开发者工具中测试）
- 页面是否已完全加载
- 元素是否在 iframe 中（当前不支持 iframe）

### Q: 列表抓取的数据数量不对怎么办？
A: 请确保配置了 `container` 字段：
- `container` 用于指定列表项容器的 CSS 选择器
- 在控制台测试：`document.querySelectorAll('.item').length`
- 详细说明请查看 **CONTAINER_GUIDE.md**

### Q: 列表抓取时为什么会停止？
A: 可能原因：
- 已到达最后一页
- 找不到"下一页"按钮
- 页面加载超时

### Q: 如何找到正确的 CSS 选择器？
A: 
1. 在网页上右键点击目标元素
2. 选择"检查"或"Inspect"
3. 在开发者工具中右键点击 HTML 元素
4. 选择 Copy > Copy selector

### Q: 字段对应关系错位怎么办？
A: 这通常是因为没有指定 `container` 导致的：
- 添加 `container` 配置项
- 确保 container 选择器准确
- 参考 CONTAINER_GUIDE.md 排查问题

## 相关文档

- **CONTAINER_GUIDE.md** - 列表页面 container 配置完全指南（重要！）
- **QUICK_START.md** - 5 分钟快速上手
- **CHECKLIST.md** - 安装检查清单
- **CHANGELOG.md** - 完整更新日志
- **PROJECT_OVERVIEW.md** - 项目架构概览

## 更新日志

### v1.1.0 (2026-01-14)
- ✨ 新增 `container` 配置项，提高列表抓取准确性
- 🐛 修复列表数据数量错误的问题
- 🔧 优化数据对应关系
- 📚 新增 CONTAINER_GUIDE.md 详细文档

### v1.0.0 (2026-01-14)
- 🎉 首次发布
- ✅ 支持普通页面和列表页面抓取
- ✅ 支持属性值获取
- ✅ 配置自动保存
- ✅ JSON 文件导出功能

## 许可证

MIT License

## 反馈与贡献

如有问题或建议，欢迎提交 Issue 或 Pull Request。
