// DOM 元素
const normalModeBtn = document.getElementById('normalMode');
const listModeBtn = document.getElementById('listMode');
const normalModePanel = document.getElementById('normalModePanel');
const listModePanel = document.getElementById('listModePanel');

const scrapeNormalBtn = document.getElementById('scrapeNormal');
const scrapeListBtn = document.getElementById('scrapeList');
const normalConfigInput = document.getElementById('normalConfig');
const listConfigInput = document.getElementById('listConfig');

const normalResultBox = document.getElementById('normalResult');
const normalResultContent = document.getElementById('normalResultContent');
const copyNormalResultBtn = document.getElementById('copyNormalResult');

const listResultBox = document.getElementById('listResult');
const listResultContent = document.getElementById('listResultContent');
const listProgressBox = document.getElementById('listProgress');
const progressText = document.getElementById('progressText');
const currentPageSpan = document.getElementById('currentPage');
const progressFill = document.getElementById('progressFill');
const detailProgress = document.getElementById('detailProgress');
const currentDetailSpan = document.getElementById('currentDetail');
const totalDetailSpan = document.getElementById('totalDetail');
const totalItemsSpan = document.getElementById('totalItems');
const downloadListBtn = document.getElementById('downloadList');
const copyListResultBtn = document.getElementById('copyListResult');

const statusMessage = document.getElementById('statusMessage');

let listData = [];

// 模式切换
normalModeBtn.addEventListener('click', () => {
  normalModeBtn.classList.add('active');
  listModeBtn.classList.remove('active');
  normalModePanel.classList.add('active');
  listModePanel.classList.remove('active');
});

listModeBtn.addEventListener('click', () => {
  listModeBtn.classList.add('active');
  normalModeBtn.classList.remove('active');
  listModePanel.classList.add('active');
  normalModePanel.classList.remove('active');
});

// 显示状态消息
function showStatus(message, type = 'info', timeout = 3000) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type} show`;
  setTimeout(() => {
    statusMessage.classList.remove('show');
  }, timeout);
}

// 普通页面抓取
scrapeNormalBtn.addEventListener('click', async () => {
  const configText = normalConfigInput.value.trim();

  if (!configText) {
    showStatus('请输入字段配置', 'error');
    return;
  }

  try {
    const config = JSON.parse(configText);

    if (typeof config !== 'object' || Array.isArray(config)) {
      showStatus('配置格式错误：应为对象格式', 'error');
      return;
    }

    scrapeNormalBtn.disabled = true;
    scrapeNormalBtn.textContent = '抓取中...';
    normalResultBox.style.display = 'none';

    // 获取当前标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 执行抓取
    const results = await chrome.tabs.sendMessage(tab.id, {
      action: 'scrapeNormal',
      config: config
    });

    if (results.error) {
      showStatus(results.error, 'error');
    } else {
      normalResultContent.textContent = JSON.stringify(results.data, null, 2);
      normalResultBox.style.display = 'block';
      showStatus('抓取成功！', 'success');
    }

  } catch (error) {
    showStatus('配置解析错误：' + error.message, 'error');
  } finally {
    scrapeNormalBtn.disabled = false;
    scrapeNormalBtn.textContent = '开始抓取';
  }
});

// 复制普通页面结果
copyNormalResultBtn.addEventListener('click', () => {
  const text = normalResultContent.textContent;
  navigator.clipboard.writeText(text).then(() => {
    showStatus('结果已复制到剪贴板', 'success');
  });
});

// 列表页面抓取（支持详情页）
scrapeListBtn.addEventListener('click', async () => {
  const configText = listConfigInput.value.trim();

  if (!configText) {
    showStatus('请输入列表配置', 'error');
    return;
  }

  try {
    const config = JSON.parse(configText);

    // 验证配置
    if (!config.container) {
      showStatus('配置错误：需要 container 字段', 'error');
      return;
    }

    // 检查是否为详情模式
    const hasDetail = config.detail_config && config.detail_config.detail_fields;
    const hasListFields = config.list_fields && Object.keys(config.list_fields).length > 0;

    if (!hasListFields && !hasDetail) {
      showStatus('配置错误：需要 list_fields 或 detail_config 至少一个', 'error');
      return;
    }

    // --- 修改点 1: 获取 max_items，默认为 50 ---
    const maxItems = config.max_items || 50;
    const container = config.container;

    scrapeListBtn.disabled = true;
    scrapeListBtn.textContent = '抓取中...';
    listResultBox.style.display = 'none';
    listProgressBox.style.display = 'block';
    detailProgress.style.display = hasDetail ? 'block' : 'none';
    listData = [];

    // 获取当前标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    let currentPageNum = 1;

    // --- 修改点 2: 循环条件改为数据量判断 ---
    while (listData.length < maxItems) {
      currentPageSpan.textContent = currentPageNum;
      // 进度条逻辑调整：无法预知总页数，暂时用已抓取/目标数量来显示
      const progressPercent = Math.min((listData.length / maxItems) * 100, 95);
      progressText.textContent = `正在抓取第 ${currentPageNum} 页 (已获取 ${listData.length}/${maxItems} 条)...`;
      progressFill.style.width = `${progressPercent}%`;

      let pageData = [];
      let combinedResults = [];

      // --- 修改开始：使用原子化抓取 ---

      // 1. 发送合并抓取请求
      const scrapeResult = await chrome.tabs.sendMessage(tab.id, {
        action: 'scrapeCombinedList',
        config: config.list_fields,
        container: container,
        linkSelector: config.detail_config ? config.detail_config.link_selector : null
      });

      if (scrapeResult.error) {
        showStatus(`第 ${currentPageNum} 页抓取失败：${scrapeResult.error}`, 'error');
        break;
      }

      combinedResults = scrapeResult.data || [];
      // 此时 combinedResults 结构为: [{ list_data: {...}, detail_link: "url" }, ...]
      // 数据已经绝对绑定，不会错位

      // 2. 处理详情页 (如果有配置且有链接)
      if (hasDetail) {
        // 计算还需要抓取多少条 (逻辑同之前)
        const itemsNeeded = maxItems - listData.length;
        if (combinedResults.length > itemsNeeded) {
          combinedResults = combinedResults.slice(0, itemsNeeded);
        }

        totalDetailSpan.textContent = combinedResults.filter(r => r.detail_link).length;

        // 遍历刚才抓到的结果
        for (let i = 0; i < combinedResults.length; i++) {
          const item = combinedResults[i];
          currentDetailSpan.textContent = i + 1;

          // 初始化最终数据对象，先放入列表数据
          let finalItemData = { ...item.list_data };

          // 如果有链接，去抓详情
          if (item.detail_link) {
            try {
              const detailResult = await chrome.runtime.sendMessage({
                action: 'openDetailTab',
                url: item.detail_link,
                fields: config.detail_config.detail_fields,
                waitTime: config.detail_config.wait_time || 2000
              });

              if (detailResult.success) {
                // 合并详情数据
                finalItemData = { ...finalItemData, ...detailResult.data };
                finalItemData._detail_url = item.detail_link;
              } else {
                finalItemData._detail_error = detailResult.error;
              }
            } catch (err) {
              finalItemData._detail_error = err.message;
            }
          } else {
            // 这一项没有链接（可能是因为没匹配到，或者本来就没有）
            console.log(`第 ${i + 1} 项无详情链接，仅保留列表数据`);
          }

          // 将完成的一条数据推入本页结果
          pageData.push(finalItemData);

          // 简单的防封禁延迟
          if (item.detail_link) await sleep(500);
        }
      } else {
        // 如果不需要抓详情，直接提取 list_data
        pageData = combinedResults.map(r => r.list_data);
      }

      // --- 修改结束 ---

      // 将本页数据加入总结果
      listData.push(...pageData);

      // --- 修改点 4: 判断是否需要翻页 ---
      // 如果已经达到或超过目标数量，停止循环
      if (listData.length >= maxItems) {
        break;
      }

      // 3. 翻页
      if (config.next_button) {
        const nextResult = await chrome.tabs.sendMessage(tab.id, {
          action: 'clickNext',
          selector: config.next_button
        });

        if (!nextResult.success) {
          showStatus(`已完成 ${currentPageNum} 页抓取（无法找到下一页按钮）`, 'info');
          break;
        }

        // 等待页面加载
        currentPageNum++;
        await sleep(2000);
      } else {
        // 如果没有配置下一页按钮，只抓一页就退出
        break;
      }
    }

    // 显示结果
    progressFill.style.width = '100%';
    listProgressBox.style.display = 'none';
    listResultBox.style.display = 'block';
    totalItemsSpan.textContent = listData.length;
    listResultContent.textContent = JSON.stringify(listData.slice(0, 3), null, 2) +
      (listData.length > 3 ? '\n\n... 更多数据请下载查看' : '');
    showStatus('列表抓取完成！', 'success');

  } catch (error) {
    showStatus('配置解析错误：' + error.message, 'error');
    console.error('抓取错误:', error);
  } finally {
    scrapeListBtn.disabled = false;
    scrapeListBtn.textContent = '开始抓取列表';
  }
});

// 下载列表数据
downloadListBtn.addEventListener('click', () => {
  const dataStr = JSON.stringify(listData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `scraped-data-${timestamp}.json`;

  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: true
  }, () => {
    showStatus('文件下载已开始', 'success');
    URL.revokeObjectURL(url);
  });
});

// 复制列表结果
copyListResultBtn.addEventListener('click', () => {
  const text = JSON.stringify(listData, null, 2);
  navigator.clipboard.writeText(text).then(() => {
    showStatus('完整数据已复制到剪贴板', 'success');
  });
});

// 延迟函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 加载保存的配置
chrome.storage.local.get(['normalConfig', 'listConfig'], (result) => {
  if (result.normalConfig) {
    normalConfigInput.value = result.normalConfig;
  }
  if (result.listConfig) {
    listConfigInput.value = result.listConfig;
  }
});

// 保存配置
normalConfigInput.addEventListener('blur', () => {
  chrome.storage.local.set({ normalConfig: normalConfigInput.value });
});

listConfigInput.addEventListener('blur', () => {
  chrome.storage.local.set({ listConfig: listConfigInput.value });
});
