// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('网页数据抓取器已安装');
});

// 监听来自 content script 和 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openDetailTab') {
    // 打开详情页标签并抓取数据
    handleDetailTabScraping(request, sendResponse);
    return true; // 保持消息通道开启（异步响应）
  } else if (request.action === 'batchScrapeDetails') {
    // 批量抓取详情页
    handleBatchDetailScraping(request, sendResponse);
    return true;
  }
});

// 处理单个详情页抓取
async function handleDetailTabScraping(request, sendResponse) {
  try {
    const { url, fields, waitTime = 2000, maxRetries = 3 } = request;

    if (!url) {
      sendResponse({ success: false, error: '详情页 URL 为空' });
      return;
    }

    // 重试逻辑
    let lastError = null;
    for (let retry = 0; retry < maxRetries; retry++) {
      try {
        const result = await scrapeDetailTab(url, fields, waitTime);
        sendResponse(result);
        return;
      } catch (error) {
        lastError = error;
        console.log(`详情页抓取失败，重试 ${retry + 1}/${maxRetries}:`, error.message);

        if (retry < maxRetries - 1) {
          await sleep(1000 * (retry + 1)); // 递增延迟
        }
      }
    }

    // 所有重试都失败
    sendResponse({
      success: false,
      error: `抓取失败（已重试 ${maxRetries} 次）: ${lastError.message}`
    });

  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// 处理批量详情页抓取
async function handleBatchDetailScraping(request, sendResponse) {
  try {
    const { urls, fields, waitTime = 2000, maxConcurrent = 3 } = request;
    const results = [];

    // 分批处理，控制并发
    for (let i = 0; i < urls.length; i += maxConcurrent) {
      const batch = urls.slice(i, i + maxConcurrent);
      const batchPromises = batch.map(url =>
        scrapeDetailTab(url, fields, waitTime).catch(error => ({
          success: false,
          error: error.message,
          url: url
        }))
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // 通知进度
      chrome.runtime.sendMessage({
        action: 'detailProgress',
        current: i + batch.length,
        total: urls.length
      });
    }

    sendResponse({ success: true, results });

  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// 抓取单个详情页
async function scrapeDetailTab(url, fields, waitTime) {
  let tab = null;

  try {
    // 1. 创建新标签页（不激活，在后台打开）
    tab = await chrome.tabs.create({
      url: url,
      active: false
    });

    console.log(`打开详情页标签: ${tab.id}, URL: ${url}`);

    // 2. 等待标签页加载完成
    await waitForTabLoad(tab.id);
    console.log(`标签页 ${tab.id} 加载完成`);

    // 3. 额外等待时间（让页面完全渲染）
    await sleep(waitTime);
    console.log(`等待 ${waitTime}ms 后开始抓取`);

    // 4. 确保 content script 已注入（重要！）
    try {
      await ensureContentScriptInjected(tab.id);
    } catch (error) {
      console.log('Content script 可能已注入，继续执行');
    }

    // 5. 发送消息到 content script 抓取数据
    const result = await chrome.tabs.sendMessage(tab.id, {
      action: 'scrapeDetailFields',
      fields: fields
    });

    console.log(`标签页 ${tab.id} 抓取结果:`, result);

    // 6. 关闭标签页 xxx
    await chrome.tabs.remove(tab.id);
    console.log(`关闭标签页 ${tab.id}`);

    // 7. 返回结果
    if (result.error) {
      throw new Error(result.error);
    }

    return {
      success: true,
      data: result.data,
      url: url
    };

  } catch (error) {
    console.error(`详情页抓取错误 [${url}]:`, error);

    // 确保标签页被关闭
    if (tab && tab.id) {
      try {
        await chrome.tabs.remove(tab.id);
      } catch (e) {
        // 标签页可能已经关闭
      }
    }

    throw error;
  }
}

// 确保 content script 已注入
async function ensureContentScriptInjected(tabId) {
  try {
    // 尝试注入 content script（如果已注入会失败，这是正常的）
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['src/scripts/content.js']
    });
    console.log(`手动注入 content script 到标签页 ${tabId}`);
  } catch (error) {
    // 如果注入失败，可能是因为已经注入或者权限问题
    // 这不是致命错误，可以继续
    console.log(`Content script 注入失败（可能已存在）: ${error.message}`);
  }
}

// 等待标签页加载完成
function waitForTabLoad(tabId, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error('标签页加载超时'));
    }, timeout);

    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };

    chrome.tabs.onUpdated.addListener(listener);

    // 检查标签页是否已经加载完成
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(listener);
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      if (tab.status === 'complete') {
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    });
  });
}

// 延迟函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
