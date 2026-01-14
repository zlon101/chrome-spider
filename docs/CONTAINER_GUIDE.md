# 列表页面抓取配置详解

## 为什么需要 `container` 配置？

在抓取列表页面时，**强烈推荐**指定 `container` 配置项。这个配置项用于明确指定每个列表项的容器元素，确保数据抓取的准确性。

### 问题场景

**没有 container 时可能出现的问题：**

假设页面上有 5 个商品，但每个商品有多个标题元素（主标题、副标题等），如果不指定容器：
- 可能抓取到 10 条数据（把副标题也当成了独立商品）
- 可能数据错位（商品A的标题配上了商品B的价格）
- 可能漏掉数据（某些商品结构不完整被跳过）

**使用 container 后：**
- 精确定位每个商品容器
- 保证每个容器内只抓取一次数据
- 数据对应关系准确无误

## 如何找到正确的 container 选择器？

### 方法 1：使用浏览器开发者工具

1. 打开目标网页
2. 按 F12 打开开发者工具
3. 点击左上角的"选择元素"工具（或按 Ctrl+Shift+C）
4. 点击列表中的第一个项目
5. 在 Elements 面板中，找到包含完整商品信息的最外层元素
6. 右键该元素 → Copy → Copy selector

### 方法 2：观察 HTML 结构

典型的列表页面 HTML 结构：

```html
<div class="products-list">
  <div class="product-item">  <!-- 这是 container -->
    <h3 class="title">商品1</h3>
    <span class="price">¥99</span>
    <a class="link" href="/product/1">查看详情</a>
  </div>
  <div class="product-item">  <!-- 这是 container -->
    <h3 class="title">商品2</h3>
    <span class="price">¥199</span>
    <a class="link" href="/product/2">查看详情</a>
  </div>
  <!-- 更多商品... -->
</div>
```

在这个例子中，`container` 应该设置为 `.product-item`

## 配置示例对比

### ❌ 错误配置（没有 container）

```json
{
  "next_button": ".next-page",
  "max_page": 3,
  "field": {
    "标题": ".title",
    "价格": ".price",
    "链接": ".link@href"
  }
}
```

**可能的问题：**
- 如果页面上有其他地方也使用 `.title` 类，可能抓取到错误数据
- 无法保证标题、价格、链接来自同一个商品

### ✅ 正确配置（有 container）

```json
{
  "container": ".product-item",
  "next_button": ".next-page",
  "max_page": 3,
  "field": {
    "标题": ".title",
    "价格": ".price",
    "链接": ".link@href"
  }
}
```

**效果：**
- 先找到所有 `.product-item` 容器
- 在每个容器内部查找 `.title`、`.price`、`.link`
- 保证每条数据来自同一个商品

## 常见的 container 选择器

| 网站类型 | 常见 container 示例 |
|---------|-------------------|
| 电商商品列表 | `.product-item`, `.goods-item`, `.item` |
| 新闻文章列表 | `.article-item`, `.news-item`, `.post` |
| 招聘职位列表 | `.job-item`, `.position-item` |
| 房产列表 | `.house-item`, `.property-item` |
| 搜索结果 | `.search-item`, `.result-item` |

## 验证 container 是否正确

在配置前，可以在浏览器控制台测试：

```javascript
// 测试 container 选择器
document.querySelectorAll('.product-item').length
// 应该返回当前页面的商品数量

// 测试在 container 内查找字段
document.querySelector('.product-item').querySelector('.title').textContent
// 应该返回第一个商品的标题
```

## 完整配置示例

### 示例 1：电商商品列表

```json
{
  "container": ".gl-item",
  "next_button": ".pn-next",
  "max_page": 5,
  "field": {
    "商品名称": ".p-name em",
    "价格": ".p-price i",
    "评价数": ".p-commit strong",
    "店铺": ".p-shop a",
    "商品链接": ".p-name a@href",
    "图片": ".p-img img@src"
  }
}
```

### 示例 2：新闻列表

```json
{
  "container": "article.news-item",
  "next_button": "a.next-page",
  "max_page": 3,
  "field": {
    "标题": "h2.title",
    "摘要": "p.summary",
    "发布时间": "time.publish-date",
    "作者": "span.author",
    "阅读量": "span.view-count",
    "详情链接": "a.read-more@href"
  }
}
```

### 示例 3：招聘列表

```json
{
  "container": ".job-primary",
  "next_button": ".next",
  "max_page": 10,
  "field": {
    "职位名称": ".job-title",
    "公司名称": ".company-name a",
    "薪资": ".salary",
    "地点": ".job-area",
    "经验要求": ".job-limit .experience",
    "学历要求": ".job-limit .education",
    "详情页": ".job-title a@href"
  }
}
```

## 高级技巧

### 1. 使用更具体的选择器

如果页面结构复杂，可以使用更精确的选择器：

```json
{
  "container": "div.list-container > div.item",
  "container": "#search-results .result-item",
  "container": "ul.product-list > li"
}
```

### 2. 处理嵌套列表

如果列表项内还有子列表，确保 container 指向正确的层级：

```json
{
  "container": ".main-item",  // 不是 ".sub-item"
  "field": {
    "主标题": ".main-title",
    "子项数量": ".sub-item"  // 会统计子项数量
  }
}
```

### 3. 使用属性选择器

```json
{
  "container": "div[data-item-type='product']",
  "container": "li[class*='item']"
}
```

## 排查问题

### 问题：抓取到的数据数量不对

**检查步骤：**
1. 在控制台运行：`document.querySelectorAll('你的container选择器').length`
2. 检查返回的数量是否等于页面上的实际项目数
3. 如果不相等，调整 container 选择器

### 问题：某些字段为 null

**检查步骤：**
1. 确认该字段在 container 内部确实存在
2. 在控制台测试：
   ```javascript
   document.querySelector('container选择器')
     .querySelector('字段选择器')
   ```
3. 如果返回 null，说明选择器不正确

### 问题：数据错位

**原因：**
- 没有使用 container，或 container 选择器不准确
- 字段选择器匹配到了 container 外的元素

**解决：**
- 确保指定了正确的 container
- 使用更具体的字段选择器，避免匹配到其他元素

## 最佳实践

1. **总是使用 container**：除非页面结构极其简单，否则始终指定 container
2. **先测试再抓取**：在控制台验证 container 和字段选择器
3. **使用类选择器**：类选择器通常比标签选择器更稳定
4. **避免过于复杂的选择器**：简单清晰的选择器更易维护
5. **记录配置**：为常用网站保存配置文件

## 总结

`container` 配置是列表页面抓取准确性的关键：

✅ **使用 container 的好处：**
- 数据准确无误
- 结构清晰易懂
- 易于调试维护

❌ **不使用 container 的风险：**
- 数据数量错误
- 字段对应混乱
- 难以定位问题

**建议：每次抓取列表页面时，首先找到正确的 container 选择器！**
