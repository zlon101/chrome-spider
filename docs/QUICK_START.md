# 快速入门指南

## 1. 生成图标（必须完成）

由于 Chrome 扩展需要图标才能安装，请先生成图标文件：

### 方法 A：使用 HTML 工具（推荐）

1. 用浏览器打开项目中的 `generate-icons.html` 文件
2. 点击"下载所有图标"按钮
3. 三个图标文件会自动下载到你的下载文件夹
4. 将下载的 `icon16.png`、`icon48.png`、`icon128.png` 移动到 `icons/` 文件夹

### 方法 B：使用在线工具

1. 访问 https://www.favicon-generator.org/
2. 上传 `icons/icon.svg` 文件
3. 下载生成的图标
4. 重命名并放入 `icons/` 文件夹

## 2. 安装扩展

1. 打开 Chrome 浏览器
2. 在地址栏输入：`chrome://extensions/`
3. 打开右上角的"开发者模式"开关
4. 点击"加载已解压的扩展程序"
5. 选择本项目文件夹：`/Users/admin/work/chrome-spider`
6. 安装完成！你会在浏览器工具栏看到扩展图标

## 3. 测试扩展

### 测试普通页面抓取

1. 用浏览器打开 `test-normal-page.html`
2. 点击浏览器工具栏中的扩展图标
3. 确保选中"普通页面"模式
4. 复制以下配置到输入框：

```json
{
  "姓名": ".name",
  "年龄": ".age span:last-child",
  "邮箱": ".email a",
  "邮箱链接": ".email a@href",
  "电话": ".phone",
  "地址": ".address",
  "网站": ".website a@href"
}
```

5. 点击"开始抓取"
6. 查看抓取结果

### 测试列表页面抓取

1. 用浏览器打开 `test-list-page.html`
2. 点击扩展图标
3. 切换到"列表页面"模式
4. 复制以下配置：

```json
{
  "container": ".article-item",
  "next_button": ".next-page",
  "max_page": 3,
  "field": {
    "标题": ".article-title",
    "摘要": ".article-summary",
    "作者": ".article-author",
    "日期": ".article-date",
    "链接": ".article-link@href"
  }
}
```

5. 点击"开始抓取列表"
6. 观察扩展自动翻页并抓取数据
7. 完成后可以下载 JSON 文件

## 4. 在真实网站上使用

### 查找 CSS 选择器的方法

1. 在网页上右键点击想要抓取的元素
2. 选择"检查"（Inspect）
3. 在开发者工具中，右键点击 HTML 元素
4. 选择 Copy → Copy selector
5. 将选择器粘贴到配置中

### 常见选择器示例

```
类选择器：    .title
ID选择器：    #main
标签选择器：   h1
后代选择器：   .container .item
子选择器：    .parent > .child
属性选择器：   a[href]

获取属性值：
  链接地址：   a@href
  图片地址：   img@src
  自定义属性： div@data-id
```

## 5. 常见问题

### Q: 抓取不到数据？
- 检查 CSS 选择器是否正确
- 确认页面已完全加载
- 尝试在控制台测试：`document.querySelector('你的选择器')`

### Q: 列表抓取中断？
- 检查"下一页"按钮的选择器是否正确
- 确认页面加载完成再继续
- 适当增加页面间的等待时间

### Q: 如何获取属性值？
- 在选择器后加 `@属性名`
- 例如：`a.link@href` 获取链接地址
- 例如：`img@src` 获取图片地址

## 6. 高级技巧

### 精确定位元素

```json
{
  "标题": "article h2.title",
  "第一段": "article p:first-child",
  "最后一个链接": "article a:last-child",
  "第三个项目": "ul li:nth-child(3)"
}
```

### 批量抓取

列表页面会自动处理多个相同结构的元素，只需确保选择器能匹配到所有列表项即可。

### 数据清洗

抓取后的数据可能包含多余的空格或换行，可以使用 JSON 处理工具进一步清洗数据。

## 7. 注意事项

⚠️ **重要提醒：**

1. 尊重网站的 robots.txt 和使用条款
2. 不要过于频繁地抓取，避免给服务器造成压力
3. 某些网站可能有反爬虫机制
4. 抓取的数据仅供个人学习使用
5. 不要抓取敏感或私密信息

## 8. 获取帮助

- 查看 `README.md` 了解完整文档
- 使用测试页面熟悉功能
- 在浏览器控制台查看错误信息

祝使用愉快！🎉
