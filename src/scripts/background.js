// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('网页数据抓取器已安装');
});

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 这里可以处理需要后台处理的任务
  return true;
});
