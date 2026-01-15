# 列表详情页抓取功能使用指南

## 功能概述

列表详情页抓取功能允许你在抓取列表数据的同时，自动打开每个列表项的详情页进行深度抓取，最后将列表数据和详情数据合并输出。

### 适用场景

- 商品列表 + 商品详情页
- 文章列表 + 文章详情页
- 招聘列表 + 职位详情页
- 新闻列表 + 新闻详情页

---

## 配置结构

### 完整配置示例

```json
{
  "container": ".product-item",
  "next_button": ".next-page",
  "max_page": 3,
  
  "list_fields": {
    "商品名称": ".product-title",
    "价格": ".product-price",
    "简介": ".product-summary"
  },
  
  "detail_config": {
    "link_selector": ".product-link@href",
    "wait_time": 2000,
    "detail_fields": {
      "详细描述": ".detail-content",
      "规格参数": ".detail-specs",
      "用户评价": ".reviews"
    }
  }
}
```

### 配置字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `container` | String | 是 | 列表项容器选择器 |
| `next_button` | String | 否 | 下一页按钮选择器（多页时需要） |
| `max_page` | Number | 否 | 最大抓取页数，默认 10 |
| `list_fields` | Object | 否 | 列表页字段配置 |
| `detail_config` | Object | 否 | 详情页配置 |
| `detail_config.link_selector` | String | 是* | 详情页链接选择器 |
| `detail_config.wait_time` | Number | 否 | 页面加载等待时间(ms)，默认 2000 |
| `detail_config.detail_fields` | Object | 是* | 详情页字段配置 |

**注意**：`list_fields` 和 `detail_config` 至少需要配置一个。

---

## 使用模式

### 模式 1：仅抓取列表字段（不抓详情）

```json
{
  "container": ".article-item",
  "next_button": ".next-page",
  "max_page": 3,
  "list_fields": {
    "标题": ".title",
    "摘要": ".summary",
    "日期": ".date"
  }
}
```

**输出结果**：
```json
[
  {
    "标题": "文章1",
    "摘要": "这是摘要",
    "日期": "2026-01-01"
  }
]
```

### 模式 2：仅抓取详情字段（不抓列表）

```json
{
  "container": ".article-item",
  "detail_config": {
    "link_selector": "a.detail@href",
    "wait_time": 2000,
    "detail_fields": {
      "正文": "article.content",
      "作者": ".author",
      "阅读量": ".views"
    }
  }
}
```

**输出结果**：
```json
[
  {
    "正文": "这是正文内容...",
    "作者": "张三",
    "阅读量": "1234",
    "_detail_url": "https://example.com/article/1"
  }
]
```

### 模式 3：列表 + 详情（推荐）

```json
{
  "container": ".product-item",
  "list_fields": {
    "商品名": ".title",
    "价格": ".price"
  },
  "detail_config": {
    "link_selector": "a.detail@href",
    "detail_fields": {
      "详细描述": ".description",
      "库存": ".stock"
    }
  }
}
```

**输出结果**：
```json
[
  {
    "商品名": "商品1",
    "价格": "¥99",
    "详细描述": "这是详细描述...",
    "库存": "100件",
    "_detail_url": "https://example.com/product/1"
  }
]
```

---

## 详细说明

### 1. 链接选择器 (link_selector)

用于在列表项中找到详情页链接。

**示例**：

```json
// 获取 href 属性（默认）
"link_selector": "a.detail-link@href"

// 获取其他属性
"link_selector": "a@data-url"

// 不指定属性，默认获取 href
"link_selector": "a.detail-link"
```

**注意**：
- 链接选择器在每个 `container` 内查找
- 支持相对路径，会自动转换为绝对路径
- 如果找不到链接，该项会跳过详情抓取

### 2. 等待时间 (wait_time)

详情页加载后的额外等待时间，单位毫秒。

```json
"wait_time": 2000  // 等待 2 秒
```

**何时需要增加等待时间**：
- 详情页有动态加载内容
- 详情页使用了延迟渲染
- 网络较慢需要更多时间

**建议值**：
- 静态页面：1000-1500ms
- 动态页面：2000-3000ms
- 复杂页面：3000-5000ms

### 3. 数据合并规则

列表数据和详情数据会自动合并：

```json
// 列表数据
{
  "标题": "文章1",
  "摘要": "摘要内容"
}

// 详情数据
{
  "正文": "正文内容",
  "作者": "张三"
}

// 合并后
{
  "标题": "文章1",
  "摘要": "摘要内容",
  "正文": "正文内容",
  "作者": "张三",
  "_detail_url": "https://example.com/article/1"
}
```

**字段冲突处理**：
- 如果列表字段和详情字段同名，详情字段会覆盖列表字段
- 系统会自动添加 `_detail_url` 字段记录详情页链接

### 4. 错误处理

详情页抓取失败时的处理：

```json
{
  "标题": "商品1",
  "价格": "¥99",
  "_detail_url": "https://example.com/product/1",
  "_detail_error": "标签页加载超时"
}
```

系统会：
1. 自动重试 3 次
2. 仍失败则记录错误信息
3. 继续抓取下一项
4. 保留已抓取的列表字段数据

---

## 实战案例

### 案例 1：电商商品抓取

```json
{
  "container": ".goods-item",
  "next_button": ".page-next",
  "max_page": 5,
  
  "list_fields": {
    "商品名称": ".goods-name",
    "价格": ".goods-price",
    "销量": ".sales-count",
    "店铺": ".shop-name"
  },
  
  "detail_config": {
    "link_selector": "a.goods-link@href",
    "wait_time": 2500,
    "detail_fields": {
      "详细描述": ".detail-desc",
      "规格参数": ".param-list",
      "用户评价数": ".comment-count",
      "好评率": ".praise-rate",
      "发货地": ".ship-from"
    }
  }
}
```

### 案例 2：招聘信息抓取

```json
{
  "container": ".job-item",
  "next_button": "a.next",
  "max_page": 10,
  
  "list_fields": {
    "职位名称": ".job-title",
    "公司名称": ".company-name",
    "薪资范围": ".salary",
    "工作地点": ".location"
  },
  
  "detail_config": {
    "link_selector": ".job-title a@href",
    "wait_time": 2000,
    "detail_fields": {
      "职位描述": ".job-description",
      "任职要求": ".job-requirement",
      "公司介绍": ".company-intro",
      "公司规模": ".company-size",
      "公司福利": ".welfare-tags"
    }
  }
}
```

### 案例 3：新闻文章抓取

```json
{
  "container": "article.news-item",
  "next_button": ".pagination-next",
  "max_page": 3,
  
  "list_fields": {
    "标题": "h2.title",
    "发布时间": "time.pub-date",
    "来源": ".source"
  },
  
  "detail_config": {
    "link_selector": "h2.title a@href",
    "wait_time": 1500,
    "detail_fields": {
      "正文内容": ".article-content",
      "作者": ".author-name",
      "阅读量": ".read-count",
      "关键词": ".keywords"
    }
  }
}
```

---

## 性能优化建议

### 1. 控制抓取数量

```json
{
  "max_page": 3  // 不要一次抓取太多页
}
```

**建议**：
- 测试时：1-2 页
- 正式使用：不超过 10 页
- 大量数据：分批次抓取

### 2. 合理设置等待时间

```json
{
  "wait_time": 2000  // 根据实际需要调整
}
```

**平衡点**：
- 太短：可能数据未加载完成
- 太长：浪费时间
- 建议：先用 3000ms 测试，然后逐步减少

### 3. 简化字段配置

只抓取必要的字段，减少选择器数量。

❌ **不推荐**：
```json
"detail_fields": {
  "字段1": ".selector1",
  "字段2": ".selector2",
  "字段3": ".selector3",
  // ... 20 个字段
}
```

✅ **推荐**：
```json
"detail_fields": {
  "核心字段1": ".selector1",
  "核心字段2": ".selector2",
  "核心字段3": ".selector3"
}
```

---

## 常见问题

### Q1: 详情页抓取很慢？

**A**: 可能原因和解决方案：

1. **等待时间过长**
   - 检查 `wait_time` 是否过大
   - 尝试减少到 1500-2000ms

2. **页面加载慢**
   - 网络问题，更换网络环境
   - 网站服务器响应慢，无法优化

3. **抓取数量多**
   - 减少 `max_page` 数量
   - 分批次抓取

### Q2: 详情页数据为空？

**A**: 检查以下几点：

1. **链接选择器错误**
   ```javascript
   // 在列表页控制台测试
   document.querySelector('.product-item').querySelector('a.detail@href')
   ```

2. **详情页字段选择器错误**
   - 手动打开一个详情页
   - 在控制台测试选择器

3. **页面未完全加载**
   - 增加 `wait_time` 到 3000-5000ms

### Q3: 某些详情页抓取失败？

**A**: 查看结果中的 `_detail_error` 字段：

```json
{
  "_detail_error": "标签页加载超时"
}
```

**可能原因**：
- 详情链接无效（404）
- 页面加载超时（增加 wait_time）
- 详情页需要登录
- 反爬虫限制

### Q4: 如何知道抓取进度？

**A**: 查看扩展弹窗的进度显示：

```
正在抓取第 2 页...
详情页: 5 / 10
█████████░░░░░░░░ 50%
```

- 显示当前页数
- 显示当前详情页进度
- 进度条实时更新

### Q5: 抓取被网站屏蔽？

**A**: 采取以下措施：

1. **降低抓取频率**
   - 增加 `wait_time`
   - 减少 `max_page`

2. **避开高峰时间**
   - 选择夜间或流量低谷时段

3. **尊重网站规则**
   - 查看 robots.txt
   - 遵守网站服务条款

---

## 注意事项

### ⚠️ 重要提醒

1. **尊重网站规则**
   - 查看并遵守 robots.txt
   - 不要过度频繁抓取
   - 遵守网站服务条款

2. **数据使用**
   - 仅供个人学习研究
   - 不得用于商业用途
   - 尊重数据版权

3. **性能考虑**
   - 详情页抓取会打开多个标签页
   - 占用较多内存和网络资源
   - 建议分批次进行

4. **错误处理**
   - 详情页抓取可能失败
   - 检查 `_detail_error` 字段
   - 必要时手动补充数据

---

## 测试页面

使用提供的测试页面验证功能：

```bash
tests/test-list-detail-page.html
```

**测试配置**：
```json
{
  "container": ".product-item",
  "next_button": ".next-page",
  "max_page": 2,
  "list_fields": {
    "商品名称": ".product-title",
    "价格": ".product-price",
    "简介": ".product-summary"
  },
  "detail_config": {
    "link_selector": ".product-link@href",
    "wait_time": 1500,
    "detail_fields": {
      "详细描述": ".detail-content",
      "规格参数": ".detail-specs",
      "作者": ".detail-author"
    }
  }
}
```

**预期结果**：
- 抓取 2 页，共 10 条数据
- 每条包含列表字段 + 详情字段
- 总耗时约 20-30 秒

---

## 总结

### ✅ 优势

- 🚀 **自动化**: 无需手动点击详情页
- 🎯 **准确**: 数据来源明确，可追溯
- 💪 **强大**: 支持复杂场景和多种配置
- 🔧 **灵活**: 可选择抓取列表、详情或两者

### 📝 最佳实践

1. 先测试 1-2 页，验证配置正确
2. 合理设置 `wait_time`，平衡速度和准确性
3. 只抓取必要的字段，提高效率
4. 分批次抓取大量数据
5. 检查 `_detail_error` 及时发现问题

### 🎓 学习建议

1. 从简单场景开始（单页 + 少量详情）
2. 逐步增加复杂度（多页 + 更多字段）
3. 理解配置含义，灵活调整
4. 善用测试页面验证想法

---

**祝您使用愉快！** 🎉
