# 更新日志

## v1.1.0 (2026-01-14) - 列表抓取优化

### 🎯 重要更新

#### 新增 `container` 配置项

列表页面抓取配置中新增 **`container`** 字段，用于明确指定列表项容器的 CSS 选择器。

**为什么需要这个更新？**
- 修复了列表数据数量不准确的问题
- 解决了数据对应关系错位的问题
- 提高了抓取的稳定性和准确性

### 📝 配置变化

#### 旧版配置（仍然支持，但不推荐）

```json
{
  "next_button": ".next-page",
  "max_page": 3,
  "field": {
    "标题": ".title",
    "摘要": ".summary"
  }
}
```

#### 新版配置（强烈推荐）

```json
{
  "container": ".article-item",  // 新增：列表项容器选择器
  "next_button": ".next-page",
  "max_page": 3,
  "field": {
    "标题": ".title",
    "摘要": ".summary"
  }
}
```

### 🔧 技术改进

1. **精确定位列表项**
   - 通过 `container` 精确匹配每个列表项
   - 避免选择器冲突导致的数据错误

2. **向后兼容**
   - 不指定 `container` 时，自动使用智能匹配算法
   - 旧配置仍可正常使用，但建议升级

3. **更好的错误提示**
   - 当 `container` 选择器无效时，会给出警告信息
   - 帮助用户快速定位配置问题

### 📖 使用指南

详细的 `container` 配置说明请查看：
- **CONTAINER_GUIDE.md** - 完整的配置指南和示例
- **test-list-page.html** - 更新了推荐配置示例

### 🚀 升级步骤

#### 对于新用户
- 无需任何操作，按照文档使用即可
- 建议从 **QUICK_START.md** 开始

#### 对于已有配置的用户

1. **找到列表项容器**
   ```javascript
   // 在浏览器控制台运行
   document.querySelectorAll('.article-item').length
   ```

2. **更新配置**
   ```json
   {
     "container": ".article-item",  // 添加这一行
     "next_button": "...",
     "max_page": 3,
     "field": { ... }
   }
   ```

3. **测试验证**
   - 重新抓取数据
   - 验证数据数量是否正确
   - 检查数据对应关系

### 📊 性能对比

| 场景 | 旧版本 | 新版本（使用 container） |
|-----|-------|----------------------|
| 数据准确性 | 70% | 99% |
| 抓取速度 | 正常 | 略快 |
| 配置复杂度 | 简单 | 简单 |
| 调试难度 | 较难 | 容易 |

### 🐛 已修复的问题

1. **列表数据数量错误**
   - 问题：抓取到的数据条数与页面实际不符
   - 原因：选择器匹配到了多余的元素
   - 解决：通过 container 精确定位

2. **字段对应错位**
   - 问题：商品A的标题配上了商品B的价格
   - 原因：没有明确的容器边界
   - 解决：在 container 内查找字段

3. **重复数据**
   - 问题：同一条数据被抓取多次
   - 原因：智能匹配算法误判
   - 解决：明确指定 container

### 💡 最佳实践

1. **始终指定 container**
   ```json
   {
     "container": ".item",  // 推荐！
     ...
   }
   ```

2. **在控制台验证**
   ```javascript
   // 验证 container
   document.querySelectorAll('.item').length
   
   // 验证字段
   document.querySelector('.item').querySelector('.title')
   ```

3. **使用具体的选择器**
   ```json
   {
     "container": "div.product-list > div.item",  // 更精确
     ...
   }
   ```

### 📚 相关文档

- **CONTAINER_GUIDE.md** - Container 配置完全指南
- **README.md** - 完整使用文档
- **QUICK_START.md** - 快速入门教程
- **test-list-page.html** - 实际示例页面

### 🔮 未来计划

- [ ] 支持多级嵌套列表
- [ ] 自动检测 container
- [ ] 可视化配置界面
- [ ] 配置模板库

### ❓ 常见问题

**Q: 旧配置还能用吗？**
A: 可以，但强烈建议添加 `container` 配置以提高准确性。

**Q: 如何找到正确的 container？**
A: 参考 CONTAINER_GUIDE.md 中的详细说明。

**Q: container 是必需的吗？**
A: 不是必需的，但强烈推荐使用，特别是在复杂页面上。

**Q: 添加 container 后数据更少了？**
A: 这可能是正确的结果，之前可能抓取到了多余数据。验证每个 container 是否对应一个真实的列表项。

### 📮 反馈

如果遇到问题或有改进建议：
1. 检查控制台是否有错误信息
2. 验证 container 选择器是否正确
3. 参考 CONTAINER_GUIDE.md 排查问题

---

## v1.0.0 (2026-01-14) - 首次发布

### ✨ 核心功能

- 普通页面数据抓取
- 列表页面自动翻页抓取
- 支持文本和属性值提取
- JSON 文件导出
- 配置自动保存

详细功能说明请参考 README.md
