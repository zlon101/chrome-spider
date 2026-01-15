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

    const maxPage = config.max_page || 10;
    const container = config.container;

    scrapeListBtn.disabled = true;
    scrapeListBtn.textContent = '抓取中...';
    listResultBox.style.display = 'none';
    listProgressBox.style.display = 'block';
    detailProgress.style.display = hasDetail ? 'block' : 'none';
    listData = [];

    // 获取当前标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 开始抓取
    for (let page = 1; page <= maxPage; page++) {
      currentPageSpan.textContent = page;
      progressText.textContent = `正在抓取第 ${page} 页...`;
      progressFill.style.width = `${(page / maxPage) * 100}%`;

      let pageData = [];

      // 1. 抓取列表字段（如果配置了）
      if (hasListFields) {
        const listResults = await chrome.tabs.sendMessage(tab.id, {
          action: 'scrapeList',
          config: config.list_fields,
          container: container
        });

        if (listResults.error) {
          showStatus(`第 ${page} 页列表抓取失败：${listResults.error}`, 'error');
          break;
        }

        pageData = listResults.data || [];
      }

      // 2. 抓取详情页数据（如果配置了）
      if (hasDetail) {
        progressText.textContent = `正在抓取第 ${page} 页的详情...`;
        
        // 获取详情页链接
        const linksResult = await chrome.tabs.sendMessage(tab.id, {
          action: 'getDetailLinks',
          container: container,
          linkSelector: config.detail_config.link_selector
        });

        if (linksResult.error) {
          showStatus(`获取详情链接失败：${linksResult.error}`, 'error');
          break;
        }

        const detailLinks = linksResult.links || [];
        totalDetailSpan.textContent = detailLinks.length;

        // 如果没有列表字段，初始化 pageData
        if (!hasListFields) {
          pageData = detailLinks.map(() => ({}));
        }

        // 抓取每个详情页
        for (let i = 0; i < detailLinks.length; i++) {
          const url = detailLinks[i];
          currentDetailSpan.textContent = i + 1;

          if (!url) {
            console.log(`第 ${i + 1} 项没有详情链接，跳过`);
            continue;
          }

          try {
            // 通过 background 打开新标签页抓取
            const detailResult = await chrome.runtime.sendMessage({
              action: 'openDetailTab',
              url: url,
              fields: config.detail_config.detail_fields,
              waitTime: config.detail_config.wait_time || 2000,
              maxRetries: 3
            });

            if (detailResult.success && detailResult.data) {
              // 合并列表数据和详情数据
              pageData[i] = {
                ...pageData[i],
                ...detailResult.data,
                _detail_url: url
              };
            } else {
              console.error(`详情页抓取失败 [${i + 1}]:`, detailResult.error);
              pageData[i] = {
                ...pageData[i],
                _detail_url: url,
                _detail_error: detailResult.error
              };
            }
          } catch (error) {
            console.error(`详情页抓取异常 [${i + 1}]:`, error);
            pageData[i] = {
              ...pageData[i],
              _detail_url: url,
              _detail_error: error.message
            };
          }

          // 添加小延迟，避免过快
          await sleep(500);
        }
      }

      listData.push(...pageData);

      // 3. 翻页（如果不是最后一页）
      if (page < maxPage && config.next_button) {
        const nextResult = await chrome.tabs.sendMessage(tab.id, {
          action: 'clickNext',
          selector: config.next_button
        });

        if (!nextResult.success) {
          showStatus(`已完成 ${page} 页抓取（无法找到下一页按钮）`, 'info');
          break;
        }

        // 等待页面加载
        await sleep(2000);
      }
    }

    // 显示结果
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
