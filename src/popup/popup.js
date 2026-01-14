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
const currentPageSpan = document.getElementById('currentPage');
const progressFill = document.getElementById('progressFill');
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

// 列表页面抓取
scrapeListBtn.addEventListener('click', async () => {
  const configText = listConfigInput.value.trim();

  if (!configText) {
    showStatus('请输入列表配置', 'error');
    return;
  }

  try {
    const config = JSON.parse(configText);

    if (!config.next_button || !config.field) {
      showStatus('配置格式错误：需要 next_button 和 field 字段', 'error');
      return;
    }

    const maxPage = config.max_page || 10;
    const container = config.container || null;

    scrapeListBtn.disabled = true;
    scrapeListBtn.textContent = '抓取中...';
    listResultBox.style.display = 'none';
    listProgressBox.style.display = 'block';
    listData = [];

    // 获取当前标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 开始抓取
    for (let page = 1; page <= maxPage; page++) {
      currentPageSpan.textContent = page;
      progressFill.style.width = `${(page / maxPage) * 100}%`;

      // 抓取当前页
      const results = await chrome.tabs.sendMessage(tab.id, {
        action: 'scrapeList',
        config: config.field,
        container: container
      });

      if (results.error) {
        showStatus(`第 ${page} 页抓取失败：${results.error}`, 'error');
        break;
      }

      listData.push(...results.data);

      // 如果不是最后一页，点击下一页按钮
      if (page < maxPage) {
        const nextResult = await chrome.tabs.sendMessage(tab.id, {
          action: 'clickNext',
          selector: config.next_button
        });

        if (!nextResult.success) {
          showStatus(`已完成 ${page} 页抓取（无法找到下一页按钮）`, 'info');
          break;
        }

        // 等待页面加载
        await new Promise(resolve => setTimeout(resolve, 2000));
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
    showStatus('配置解析错误：' + error.message, 'error', 999999999);
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
