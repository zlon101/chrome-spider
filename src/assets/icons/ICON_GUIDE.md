# 图标创建指南

由于无法直接创建 PNG 文件，请按以下步骤创建图标：

## 方法一：使用在线工具

1. 访问 https://www.favicon-generator.org/ 或 https://favicon.io/
2. 上传 `icon.svg` 文件
3. 生成并下载 16x16、48x48、128x128 三个尺寸的 PNG 图标
4. 将文件重命名为：
   - icon16.png
   - icon48.png
   - icon128.png
5. 放入 `icons/` 文件夹

## 方法二：使用图像编辑软件

### 使用 Photoshop / GIMP：
1. 打开 `icon.svg` 文件
2. 创建新文档，尺寸分别为：
   - 16x16 像素
   - 48x48 像素
   - 128x128 像素
3. 将 SVG 图标复制到新文档并调整大小
4. 导出为 PNG 格式
5. 保存为对应的文件名

### 使用命令行工具（ImageMagick）：

如果已安装 ImageMagick，可以运行以下命令：

```bash
cd /Users/admin/work/chrome-spider/icons

# 转换 SVG 为不同尺寸的 PNG
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

## 方法三：使用简单图标（临时方案）

如果暂时无法创建图标，可以：

1. 从 https://www.flaticon.com/ 搜索 "spider" 或 "web scraper"
2. 下载免费图标
3. 调整为需要的三个尺寸
4. 放入 `icons/` 文件夹

## 图标设计建议

图标应该体现：
- 🕸️ 蜘蛛网：代表网页爬虫
- 📊 数据：代表数据采集
- 🔍 搜索：代表信息提取
- 简洁清晰的设计
- 在小尺寸下仍然可识别

## 完成后

确保 `icons/` 文件夹包含以下文件：
- icon16.png
- icon48.png
- icon128.png

然后即可加载扩展到 Chrome 浏览器。
