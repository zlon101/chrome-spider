# 详情页抓取问题排查指南

## 问题：详情页字段抓取结果为空

如果遇到详情页数据全部为空（null）的情况，请按照以下步骤排查。

---

## 🔍 快速诊断

### 1. 打开浏览器控制台

按 `F12` 或 `Ctrl+Shift+I` (Mac: `Cmd+Option+I`) 打开开发者工具。

### 2. 查看 Console 日志

在抓取过程中，控制台会输出详细的日志信息：

```
打开详情页标签: 123, URL: https://...
标签页 123 加载完成
等待 2000ms 后开始抓取
收到 scrapeDetailFields 请求，字段配置: {...}
开始抓取页面数据，配置: {...}
当前页面 URL: https://...
查找字段 "详细描述"，选择器: .detail-content
  找到元素，文本内容: ...
...
```

---

## 🐛 常见问题及解决方案

### 问题 1: Content Script 未注入

**症状**：
- 控制台报错：`Could not establish connection`
- 没有看到 "收到 scrapeDetailFields 请求" 日志

**原因**：
详情页的 content script 没有被正确注入。

**解决方案**：

1. **检查 manifest.json 权限**
```json
{
  "permissions": [
    "activeTab",
    "scripting",
    "storage",
    "downloads",
    "tabs"  // 确保有这个权限
  ]
}
```

2. **重新加载扩展**
   - 打开 `chrome://extensions/`
   - 找到扩展
   - 点击刷新按钮 🔄

3. **检查 URL 匹配**
   - 确保详情页 URL 不是特殊协议（如 chrome://、about:// 等）
   - 某些网站可能有限制

---

### 问题 2: 选择器错误

**症状**：
- 看到 "未找到元素" 日志
- 数据为 null

**排查步骤**：

1. **手动打开一个详情页**

2. **在控制台测试选择器**
```javascript
// 测试你的选择器
document.querySelector('.detail-content')
document.querySelector('.detail-specs')

// 如果找不到，尝试查看页面结构
document.body.innerHTML  // 查看整个页面 HTML
```

3. **常见选择器问题**：
   - 类名写错：`.detial-content` vs `.detail-content`
   - 选择器不存在：页面结构变了
   - 动态加载：内容还没加载出来

**解决方案**：

```json
{
  "detail_config": {
    "wait_time": 3000,  // 增加等待时间到 3 秒
    "detail_fields": {
      "描述": ".correct-selector"  // 使用正确的选择器
    }
  }
}
```

---

### 问题 3: 页面加载不完整

**症状**：
- 看到 "找到元素" 但文本为空
- 数据不完整

**原因**：
页面使用了动态加载（AJAX），内容还没加载完。

**解决方案**：

增加 `wait_time`：

```json
{
  "detail_config": {
    "wait_time": 5000  // 增加到 5 秒
  }
}
```

---

### 问题 4: 详情页需要登录

**症状**：
- 详情页打开是登录页面
- 选择器都找不到

**排查**：

在列表页手动点击一个详情链接，看是否需要登录。

**临时解决方案**：

在浏览器中先登录，然后再使用扩展抓取（可能需要设置 Cookie）。

**长期方案**：

暂不支持需要登录的详情页，这是已知限制。

---

## 🔧 调试工具

### 1. 启用详细日志

代码中已经加入了详细的 console.log，在控制台可以看到：

- 何时打开标签页
- 页面 URL
- 每个字段的查找过程
- 是否找到元素
- 抓取到的数据

### 2. 手动测试详情页

**测试脚本**：

在详情页控制台运行：

```javascript
// 模拟扩展的抓取逻辑
const fields = {
  "详细描述": ".detail-content",
  "规格参数": ".detail-specs",
  "作者": ".detail-author"
};

const data = {};

for (const [fieldName, selector] of Object.entries(fields)) {
  const element = document.querySelector(selector);
  if (element) {
    data[fieldName] = element.textContent.trim();
    console.log(`✅ ${fieldName}:`, data[fieldName].substring(0, 50));
  } else {
    data[fieldName] = null;
    console.log(`❌ ${fieldName}: 未找到元素`);
  }
}

console.log('最终数据:', data);
```

### 3. 检查标签页状态

在 background service worker 控制台（chrome://extensions/ → 点击"service worker"）：

```javascript
// 查看当前打开的所有标签页
chrome.tabs.query({}, (tabs) => {
  console.log('所有标签页:', tabs);
});
```

---

## 📋 完整排查清单

### 步骤 1: 基础检查

- [ ] 扩展已正确安装并启用
- [ ] 扩展版本是 v1.2.0 或更高
- [ ] manifest.json 包含 `tabs` 权限
- [ ] 已重新加载扩展

### 步骤 2: 配置检查

- [ ] `container` 选择器正确
- [ ] `link_selector` 能正确获取详情页链接
- [ ] `detail_fields` 选择器正确
- [ ] `wait_time` 足够长（建议 2000-5000ms）

### 步骤 3: 选择器验证

- [ ] 手动打开一个详情页
- [ ] 在控制台测试每个选择器
- [ ] 确认元素存在且有内容
- [ ] 测试属性选择器（如 @href）

### 步骤 4: 日志检查

- [ ] 打开浏览器控制台
- [ ] 执行抓取操作
- [ ] 查看是否有错误信息
- [ ] 检查 "收到 scrapeDetailFields 请求" 日志
- [ ] 检查每个字段的查找日志

### 步骤 5: 测试页面验证

- [ ] 使用提供的测试页面 `test-list-detail-page.html`
- [ ] 确认测试页面可以正常抓取
- [ ] 对比测试页面和目标页面的区别

---

## 🎯 测试用例

### 测试 1: 使用测试页面

```bash
# 打开测试页面
open tests/test-list-detail-page.html
```

**配置**：
```json
{
  "container": ".product-item",
  "next_button": ".next-page",
  "max_page": 1,
  "list_fields": {
    "商品名称": ".product-title",
    "价格": ".product-price"
  },
  "detail_config": {
    "link_selector": ".product-link@href",
    "wait_time": 2000,
    "detail_fields": {
      "详细描述": ".detail-content",
      "规格参数": ".detail-specs",
      "作者": ".detail-author"
    }
  }
}
```

**预期结果**：
- 成功抓取 5 条数据
- 每条包含列表字段 + 详情字段
- 详情字段有完整内容

如果测试页面能成功抓取，说明扩展功能正常，问题在于目标网站的配置。

---

## 💡 常见解决方案

### 方案 1: 增加等待时间

```json
{
  "detail_config": {
    "wait_time": 5000  // 从 2000 增加到 5000
  }
}
```

### 方案 2: 使用更具体的选择器

```json
// 不够具体
"描述": ".content"

// 更具体
"描述": "div.detail-page .main-content .description"
```

### 方案 3: 使用属性选择器

```json
// 如果文本为空，试试获取属性
"描述": ".content@data-content"
"描述": ".content@innerHTML"  // 获取 HTML 内容
```

### 方案 4: 检查是否在 iframe 中

```javascript
// 在详情页控制台测试
document.querySelector('.detail-content')  // 如果找不到
document.querySelector('iframe')  // 检查是否有 iframe

// 如果在 iframe 中
const iframe = document.querySelector('iframe');
iframe.contentDocument.querySelector('.detail-content')
```

**注意**：当前版本不支持 iframe，如果内容在 iframe 中，需要手动处理。

---

## 🆘 仍然无法解决？

### 1. 检查 Service Worker 日志

- 打开 `chrome://extensions/`
- 找到扩展
- 点击 "service worker" 链接
- 查看控制台日志

### 2. 提供诊断信息

如果问题仍未解决，请提供：

1. **浏览器信息**
   - Chrome 版本
   - 操作系统

2. **扩展信息**
   - 扩展版本
   - manifest.json 内容

3. **配置信息**
   - 完整的 JSON 配置
   - 目标网站 URL（如可分享）

4. **错误日志**
   - 控制台截图
   - Service worker 日志
   - 错误信息

5. **测试结果**
   - 测试页面是否能正常工作
   - 手动测试选择器的结果

---

## 📝 调试技巧总结

1. **总是先用测试页面验证**
2. **使用控制台日志追踪问题**
3. **手动测试每个选择器**
4. **逐步增加配置复杂度**
5. **对比成功和失败的案例**

---

## ✅ 验证修复

修复后，验证以下几点：

- [ ] 控制台有完整的日志输出
- [ ] 看到 "收到 scrapeDetailFields 请求"
- [ ] 看到 "找到元素" 日志
- [ ] 数据不为 null
- [ ] 数据内容正确

---

**提示**：90% 的问题都是选择器错误或页面加载不完整。先检查这两点！
