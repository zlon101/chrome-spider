# 项目目录结构说明

本文档详细说明了项目的目录组织逻辑和各文件的作用。

## 📁 整体结构

```
chrome-spider/
├── manifest.json           # Chrome 扩展配置文件（根目录必需）
├── README.md              # 项目入口文档（快速导航）
├── .gitignore             # Git 忽略配置
│
├── src/                   # 📦 源代码目录
│   ├── popup/            # 🎨 用户界面（弹出窗口）
│   ├── scripts/          # ⚙️ 核心功能脚本
│   └── assets/           # 🖼️ 静态资源
│
├── docs/                  # 📚 文档目录
│   ├── README.md         # 完整使用文档
│   ├── QUICK_START.md    # 快速入门指南
│   ├── CONTAINER_GUIDE.md# Container 配置详解
│   ├── CHECKLIST.md      # 安装检查清单
│   ├── PROJECT_OVERVIEW.md# 项目技术概览
│   ├── CHANGELOG.md      # 版本更新历史
│   └── UPDATE_SUMMARY.md # 更新内容总结
│
├── tests/                 # 🧪 测试文件
│   ├── test-normal-page.html
│   └── test-list-page.html
│
└── tools/                 # 🛠️ 开发辅助工具
    └── generate-icons.html
```

## 📂 各目录详解

### 根目录文件

#### `manifest.json` ⚡
**作用**: Chrome 扩展的核心配置文件
**必须位置**: 项目根目录（Chrome 要求）
**包含内容**:
- 扩展基本信息（名称、版本、描述）
- 权限声明
- 文件路径配置
- 图标引用

#### `README.md` 📖
**作用**: 项目入口文档，提供快速导航
**特点**:
- 简洁的功能介绍
- 清晰的文档索引
- 快速安装指引
- 目录结构说明

#### `.gitignore` 🚫
**作用**: Git 版本控制忽略规则
**包含**:
- 系统文件（.DS_Store）
- IDE 配置文件
- 临时文件
- 构建产物

---

### `src/` - 源代码目录 📦

所有扩展的源代码都放在这个目录下，按功能模块组织。

#### `src/popup/` - 用户界面 🎨

扩展弹出窗口的所有相关文件。

```
popup/
├── popup.html    # 弹出窗口的 HTML 结构
├── popup.css     # 弹出窗口的样式
└── popup.js      # 弹出窗口的交互逻辑
```

**职责**:
- 用户界面展示
- 用户输入处理
- 配置管理
- 结果显示

**文件关系**:
```
popup.html (结构)
    ↓ 引用
popup.css (样式)
popup.js (逻辑)
    ↓ 通信
content.js (执行抓取)
```

#### `src/scripts/` - 核心功能脚本 ⚙️

扩展的核心业务逻辑。

```
scripts/
├── content.js     # 内容脚本（页面数据抓取）
└── background.js  # 后台服务工作进程
```

**content.js**
- **作用**: 注入到网页中执行数据抓取
- **功能**:
  - 普通页面数据提取
  - 列表页面数据提取
  - Container 智能匹配
  - 翻页操作
- **通信**: 接收 popup.js 的消息

**background.js**
- **作用**: 后台服务工作进程（Service Worker）
- **功能**:
  - 扩展生命周期管理
  - 跨页面通信协调
  - 后台任务处理
- **特点**: Manifest V3 要求

#### `src/assets/` - 静态资源 🖼️

扩展使用的所有静态资源文件。

```
assets/
└── icons/
    ├── icon16.png      # 16x16 图标（工具栏）
    ├── icon48.png      # 48x48 图标（扩展管理页）
    ├── icon128.png     # 128x128 图标（Chrome 应用商店）
    ├── icon.svg        # 源 SVG 图标
    └── ICON_GUIDE.md   # 图标生成指南
```

**图标用途**:
- `icon16.png`: 浏览器工具栏显示
- `icon48.png`: 扩展管理页面显示
- `icon128.png`: Chrome 应用商店和安装确认
- `icon.svg`: 设计源文件，可重新生成 PNG

---

### `docs/` - 文档目录 📚

所有项目文档集中管理。

#### 文档分类

**入门文档** 🚀
```
QUICK_START.md    # 5分钟快速上手
CHECKLIST.md      # 安装检查清单
```
- 面向新用户
- 快速开始使用
- 步骤清晰明确

**使用文档** 📖
```
README.md            # 完整使用说明
CONTAINER_GUIDE.md   # Container 配置详解
```
- 详细功能说明
- 配置方法
- 最佳实践
- 常见问题

**参考文档** 📋
```
PROJECT_OVERVIEW.md  # 项目技术概览
CHANGELOG.md         # 版本更新历史
UPDATE_SUMMARY.md    # 最新更新总结
```
- 技术架构
- 版本历史
- 更新内容

#### 文档阅读顺序

**新用户推荐**:
1. `QUICK_START.md` - 快速了解如何使用
2. `CHECKLIST.md` - 确保正确安装
3. `README.md` - 深入了解所有功能
4. `CONTAINER_GUIDE.md` - 掌握列表抓取技巧

**开发者推荐**:
1. `PROJECT_OVERVIEW.md` - 了解架构
2. `README.md` - 掌握功能细节
3. `CHANGELOG.md` - 了解演进历史

---

### `tests/` - 测试文件 🧪

功能测试和示例页面。

```
tests/
├── test-normal-page.html   # 普通页面抓取测试
└── test-list-page.html     # 列表页面抓取测试
```

**用途**:
- 功能验证
- 配置示例
- 用户学习

**使用方式**:
```bash
# 在浏览器中打开测试页面
open tests/test-normal-page.html
open tests/test-list-page.html
```

**测试内容**:

**test-normal-page.html**
- 简单的用户信息页面
- 包含文本和属性提取示例
- 提供配置参考

**test-list-page.html**
- 模拟新闻文章列表
- 包含翻页功能
- 演示 container 配置的重要性

---

### `tools/` - 开发工具 🛠️

辅助开发的工具集。

```
tools/
└── generate-icons.html    # 图标生成工具
```

**generate-icons.html**
- **功能**: 一键生成所有尺寸的图标
- **使用**: 在浏览器中打开，点击下载
- **输出**: icon16.png, icon48.png, icon128.png
- **优势**: 无需安装图像编辑软件

---

## 🎯 设计原则

### 1. 关注点分离
- **UI** (`src/popup/`) - 用户界面
- **逻辑** (`src/scripts/`) - 核心功能
- **资源** (`src/assets/`) - 静态文件
- **文档** (`docs/`) - 说明文档
- **测试** (`tests/`) - 测试文件

### 2. 模块化组织
- 每个目录有明确的职责
- 相关文件放在一起
- 便于维护和扩展

### 3. 文档优先
- 完善的文档体系
- 多层次的说明
- 清晰的导航结构

### 4. 开发友好
- 清晰的目录结构
- 合理的文件命名
- 详细的注释说明

---

## 📊 文件依赖关系

### 运行时依赖

```
manifest.json
    ↓ 配置
┌───┴───┐
│       │
popup/  scripts/
  ↓       ↓
 CSS    content.js
 JS     background.js
```

### 开发依赖

```
docs/ → 说明如何使用
tests/ → 验证功能
tools/ → 辅助开发
```

---

## 🔄 文件流转

### 用户操作流程
```
1. 用户点击扩展图标
   ↓
2. 打开 popup.html
   ↓
3. 加载 popup.css, popup.js
   ↓
4. 用户输入配置
   ↓
5. popup.js 发送消息到 content.js
   ↓
6. content.js 在页面执行抓取
   ↓
7. 返回结果到 popup.js
   ↓
8. popup.html 显示结果
```

### 扩展加载流程
```
1. Chrome 读取 manifest.json
   ↓
2. 加载 background.js (Service Worker)
   ↓
3. 注入 content.js 到匹配的页面
   ↓
4. 用户点击图标时显示 popup
```

---

## 📝 命名规范

### 文件命名
- **描述性**: 文件名清楚说明内容
- **小写**: 使用小写字母和连字符
- **一致性**: 同类文件使用相同模式

### 目录命名
- **复数形式**: docs, tests, tools
- **功能导向**: popup, scripts, assets
- **简洁明确**: 避免冗长名称

---

## 🚀 扩展建议

### 可能的未来目录

```
chrome-spider/
├── src/
│   ├── popup/
│   ├── scripts/
│   ├── assets/
│   ├── utils/        # 通用工具函数（未来）
│   └── config/       # 配置文件（未来）
├── docs/
├── tests/
│   ├── unit/         # 单元测试（未来）
│   └── integration/  # 集成测试（未来）
├── tools/
└── examples/         # 配置示例库（未来）
```

---

## ✅ 检查清单

确保项目结构正确：

- [ ] `manifest.json` 在根目录
- [ ] `src/` 包含所有源代码
- [ ] `docs/` 包含所有文档
- [ ] `tests/` 包含测试页面
- [ ] `tools/` 包含辅助工具
- [ ] 根目录有 `README.md`（导航）
- [ ] 文档目录有 `README.md`（详细说明）
- [ ] 所有图标在 `src/assets/icons/`

---

## 📖 相关文档

- [项目概览](PROJECT_OVERVIEW.md) - 技术架构
- [完整文档](README.md) - 使用说明
- [更新日志](CHANGELOG.md) - 版本历史

---

**提示**: 这个结构设计遵循了 Chrome 扩展的最佳实践，同时保持了清晰的项目组织。
