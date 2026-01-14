# Chrome 网页数据抓取器

一个功能强大的 Chrome 扩展，支持普通页面和列表页面的数据抓取。

## 📚 快速导航

### 新用户入门
- 📖 **[快速开始](docs/QUICK_START.md)** - 5分钟快速上手指南
- ✅ **[安装检查清单](docs/CHECKLIST.md)** - 确保正确安装的步骤清单
- 📘 **[完整文档](docs/README.md)** - 详细的使用说明

### 核心功能文档
- 🎯 **[Container 配置指南](docs/CONTAINER_GUIDE.md)** - 列表抓取必读！
- 📊 **[项目概览](docs/PROJECT_OVERVIEW.md)** - 项目架构和技术栈
- 📝 **[更新日志](docs/CHANGELOG.md)** - 版本更新历史

### 开发和测试
- 🧪 **[测试页面](tests/)** - 功能测试页面
- 🛠️ **[工具](tools/)** - 图标生成等辅助工具

## ✨ 核心特性

### 普通页面抓取
- ✅ CSS 选择器配置字段
- ✅ 支持文本和属性值提取
- ✅ 实时结果显示
- ✅ 一键复制到剪贴板

### 列表页面抓取
- ✅ 自动翻页抓取多页数据
- ✅ **Container 配置确保数据准确**
- ✅ 实时进度显示
- ✅ 导出 JSON 文件
- ✅ 配置自动保存

## 🚀 快速安装

### 1. 生成图标（必需）
```bash
# 在浏览器中打开
open tools/generate-icons.html
# 点击"下载所有图标"，移动到 src/assets/icons/ 文件夹
```

### 2. 安装扩展
1. 打开 Chrome: `chrome://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目根目录: `/Users/admin/work/chrome-spider`

### 3. 开始使用
打开任意网页，点击浏览器工具栏中的扩展图标即可开始使用！

## 📋 配置示例

### 普通页面
```json
{
  "标题": "h1.title",
  "作者": "span.author",
  "链接": "a@href"
}
```

### 列表页面
```json
{
  "container": ".article-item",
  "next_button": ".next-page",
  "max_page": 3,
  "field": {
    "标题": ".title",
    "摘要": ".summary",
    "链接": "a@href"
  }
}
```

## 📁 项目结构

```
chrome-spider/
├── manifest.json           # Chrome 扩展配置
├── src/                    # 源代码目录
│   ├── popup/             # 弹出窗口（UI）
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   ├── scripts/           # 核心脚本
│   │   ├── content.js     # 内容脚本（数据抓取）
│   │   └── background.js  # 后台服务
│   └── assets/            # 资源文件
│       └── icons/         # 扩展图标
├── docs/                   # 文档目录
│   ├── README.md          # 完整使用文档
│   ├── QUICK_START.md     # 快速入门
│   ├── CONTAINER_GUIDE.md # Container 配置指南
│   ├── CHECKLIST.md       # 安装检查清单
│   ├── PROJECT_OVERVIEW.md# 项目概览
│   ├── CHANGELOG.md       # 更新日志
│   └── UPDATE_SUMMARY.md  # 更新总结
├── tests/                  # 测试文件
│   ├── test-normal-page.html
│   └── test-list-page.html
└── tools/                  # 辅助工具
    └── generate-icons.html
```

## 🎯 使用流程

1. **找到 CSS 选择器**
   - F12 打开开发者工具
   - 选择元素工具
   - Copy → Copy selector

2. **配置字段**
   - 普通页面：直接配置字段和选择器
   - 列表页面：必须指定 `container`

3. **开始抓取**
   - 点击"开始抓取"按钮
   - 等待完成
   - 复制或下载结果

## ⚠️ 重要提示

### 列表抓取必须指定 container！
```json
{
  "container": ".item",  // 这是关键！
  ...
}
```

不指定 container 可能导致：
- ❌ 数据数量不准确
- ❌ 字段对应关系错位
- ❌ 抓取到重复或错误数据

详细说明: [docs/CONTAINER_GUIDE.md](docs/CONTAINER_GUIDE.md)

## 📖 文档索引

### 按用途分类

**入门文档**
- [快速开始](docs/QUICK_START.md) - 新手必读
- [安装检查清单](docs/CHECKLIST.md) - 安装步骤验证
- [完整使用文档](docs/README.md) - 详细功能说明

**进阶文档**
- [Container 配置指南](docs/CONTAINER_GUIDE.md) - 列表抓取核心知识
- [项目架构概览](docs/PROJECT_OVERVIEW.md) - 技术细节

**参考文档**
- [更新日志](docs/CHANGELOG.md) - 版本历史
- [更新总结](docs/UPDATE_SUMMARY.md) - v1.1 更新内容

### 按文件类型分类

**核心代码** (`src/`)
- `popup/` - 用户界面
- `scripts/` - 核心功能逻辑
- `assets/` - 图标等资源

**文档** (`docs/`)
- 使用文档
- 配置指南
- 开发文档

**测试** (`tests/`)
- 功能测试页面
- 配置示例

**工具** (`tools/`)
- 图标生成工具
- 其他辅助工具

## 🔧 技术栈

- **Manifest V3** - 最新 Chrome 扩展规范
- **原生 JavaScript** - 无任何依赖
- **CSS3** - 现代样式
- **Chrome Extension APIs** - 完整权限控制

## 📊 版本信息

- **当前版本**: v1.1.0
- **发布日期**: 2026-01-14
- **主要更新**: 新增 container 配置，提高列表抓取准确性

查看完整更新历史: [docs/CHANGELOG.md](docs/CHANGELOG.md)

## 🆘 获取帮助

### 常见问题
1. **数据抓取不准确？** → 查看 [CONTAINER_GUIDE.md](docs/CONTAINER_GUIDE.md)
2. **安装失败？** → 参考 [CHECKLIST.md](docs/CHECKLIST.md)
3. **不知道如何配置？** → 查看 [QUICK_START.md](docs/QUICK_START.md)
4. **想了解更多功能？** → 阅读 [README.md](docs/README.md)

### 调试技巧
```javascript
// 在浏览器控制台测试选择器
document.querySelector('.your-selector')
document.querySelectorAll('.container').length
```

## ⚖️ 使用须知

1. ⚠️ **尊重版权** - 仅抓取您有权访问的数据
2. ⚠️ **遵守规则** - 查看网站的 robots.txt
3. ⚠️ **合理使用** - 避免给服务器造成压力
4. ⚠️ **数据安全** - 所有数据仅存储在本地

## 📄 许可证

MIT License - 自由使用和修改

## 🎉 开始使用

准备好了吗？从这里开始：

1. 📖 阅读 [快速开始文档](docs/QUICK_START.md)
2. ✅ 按照 [检查清单](docs/CHECKLIST.md) 安装
3. 🧪 使用 [测试页面](tests/) 练习
4. 🚀 在真实网站上使用！

---

**提示**: 如果这是你第一次使用，强烈建议按顺序阅读：
1. [QUICK_START.md](docs/QUICK_START.md)
2. [CHECKLIST.md](docs/CHECKLIST.md)
3. [CONTAINER_GUIDE.md](docs/CONTAINER_GUIDE.md)

祝使用愉快！🎊
