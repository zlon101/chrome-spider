// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeNormal') {
    // 普通页面抓取
    const result = scrapeNormalPage(request.config);
    sendResponse(result);
    return true;
  } else if (request.action === 'scrapeList') {
    // 列表页面抓取
    const result = scrapeListPage(request.config, request.container);
    sendResponse(result);
    return true;
  } else if (request.action === 'scrapeDetailFields') {
    // 抓取详情页字段（被 background.js 调用）
    console.log('收到 scrapeDetailFields 请求，字段配置:', request.fields);
    try {
      const result = scrapeNormalPage(request.fields);
      console.log('详情页抓取结果:', result);
      sendResponse(result);
    } catch (error) {
      console.error('详情页抓取错误:', error);
      sendResponse({ error: error.message });
    }
    return true;
  } else if (request.action === 'clickNext') {
    // 点击下一页按钮
    const result = clickNextButton(request.selector);
    sendResponse(result);
    return true;
  } else if (request.action === 'getDetailLinks') {
    // 获取所有详情页链接
    const result = getDetailLinks(request.container, request.linkSelector);
    sendResponse(result);
    return true;
  } else if (request.action === 'scrapeCombinedList') {
    const result = scrapeCombinedList(request.config, request.container, request.linkSelector);
    sendResponse(result);
    return true;
  }
});

// 抓取普通页面数据
function scrapeNormalPage(config) {
  try {
    console.log('开始抓取页面数据，配置:', config);
    console.log('当前页面 URL:', window.location.href);

    const data = {};

    for (const [fieldName, selector] of Object.entries(config)) {
      // 检查是否需要获取属性值
      let actualSelector = selector;
      let attribute = null;

      if (selector.includes('@')) {
        const parts = selector.split('@');
        actualSelector = parts[0];
        attribute = parts[1];
      }

      console.log(`查找字段 "${fieldName}"，选择器: ${actualSelector}${attribute ? ', 属性: ' + attribute : ''}`);

      const element = document.querySelector(actualSelector);

      if (element) {
        if (attribute) {
          // 获取属性值
          data[fieldName] = element.getAttribute(attribute) || '';
          console.log(`  找到元素，属性值: ${data[fieldName]}`);
        } else {
          // 获取文本内容
          data[fieldName] = element.textContent.trim();
          console.log(`  找到元素，文本内容: ${data[fieldName].substring(0, 50)}...`);
        }
      } else {
        data[fieldName] = null;
        console.log(`  未找到元素`);
      }
    }

    console.log('页面数据抓取完成:', data);
    return { data };
  } catch (error) {
    console.error('抓取页面数据错误:', error);
    return { error: error.message };
  }
}

// 抓取列表页面数据
function scrapeListPage(fieldConfig, containerSelector) {
  try {
    const data = [];

    // 如果指定了 container 选择器，直接使用
    if (containerSelector) {
      const listItems = document.querySelectorAll(containerSelector);

      if (listItems.length === 0) {
        return {
          data: [],
          warning: `未找到匹配的列表项容器: ${containerSelector}`
        };
      }

      // 遍历每个列表项
      for (const listItem of listItems) {
        const item = {};
        let hasData = false;

        for (const [fieldName, selector] of Object.entries(fieldConfig)) {
          let actualSelector = selector;
          let attribute = null;

          if (selector.includes('@')) {
            const parts = selector.split('@');
            actualSelector = parts[0];
            attribute = parts[1];
          }

          // 在当前列表项内查找元素
          const element = listItem.querySelector(actualSelector);

          if (element) {
            hasData = true;
            if (attribute) {
              item[fieldName] = element.getAttribute(attribute) || '';
            } else {
              item[fieldName] = element.textContent.trim();
            }
          } else {
            item[fieldName] = null;
          }
        }

        if (hasData) {
          data.push(item);
        }
      }

      return { data };
    }

    // 如果没有指定 container，使用智能匹配（原有逻辑作为备选）
    return scrapeListPageAuto(fieldConfig);

  } catch (error) {
    return { error: error.message };
  }
}

// 新增核心函数：原子化提取
function scrapeCombinedList(fieldConfig, containerSelector, linkSelector) {
  try {
    console.log('执行原子化抓取，容器:', containerSelector);

    // 1. 强制要求必须有容器选择器 (保证准确性的前提)
    if (!containerSelector) {
      return { error: "为保证数据准确性，必须配置 container (列表项容器选择器)" };
    }

    const listItems = document.querySelectorAll(containerSelector);
    const results = [];

    // 2. 遍历每一个 DOM 容器
    listItems.forEach((item, index) => {
      const entry = {
        list_data: {},
        detail_link: null,
        error: null
      };

      // A. 在当前容器内提取列表字段
      if (fieldConfig) {
        for (const [key, selectorRaw] of Object.entries(fieldConfig)) {
          try {
            // 解析选择器 (支持 @属性)
            let selector = selectorRaw;
            let attr = null;
            if (selectorRaw.includes('@')) {
              [selector, attr] = selectorRaw.split('@');
            }

            const el = item.querySelector(selector);
            if (el) {
              entry.list_data[key] = attr ? el.getAttribute(attr) : el.textContent.trim();
            } else {
              entry.list_data[key] = null; // 没找到字段，置空
            }
          } catch (e) {
            console.error(`字段 ${key} 提取失败`, e);
            entry.list_data[key] = "提取错误";
          }
        }
      }

      // B. 在当前容器内提取详情链接
      if (linkSelector) {
        let selector = linkSelector;
        let attr = 'href';
        if (linkSelector.includes('@')) {
          [selector, attr] = linkSelector.split('@');
        }

        const linkEl = item.querySelector(selector);
        if (linkEl) {
          let url = linkEl.getAttribute(attr);
          // 处理相对路径
          if (url && !url.startsWith('http')) {
            url = new URL(url, window.location.href).href;
          }
          entry.detail_link = url;
        }
      }

      results.push(entry);
    });

    return { data: results };

  } catch (error) {
    return { error: error.message };
  }
}

// 获取详情页链接
function getDetailLinks(containerSelector, linkSelector) {
  try {
    console.log('获取详情链接，容器:', containerSelector, '链接选择器:', linkSelector);

    const links = [];
    const listItems = document.querySelectorAll(containerSelector);

    if (listItems.length === 0) {
      return {
        links: [],
        error: `未找到匹配的列表项容器: ${containerSelector}`
      };
    }

    console.log(`找到 ${listItems.length} 个列表项`);

    for (const listItem of listItems) {
      let actualSelector = linkSelector;
      let attribute = null;

      if (linkSelector.includes('@')) {
        const parts = linkSelector.split('@');
        actualSelector = parts[0];
        attribute = parts[1] || 'href';
      } else {
        attribute = 'href';
      }

      const element = listItem.querySelector(actualSelector);

      if (element) {
        let url = element.getAttribute(attribute);

        // 处理相对路径
        if (url && !url.startsWith('http')) {
          url = new URL(url, window.location.href).href;
        }

        console.log(`  找到链接: ${url}`);
        links.push(url || null);
      } else {
        console.log(`  未找到链接元素，选择器: ${actualSelector}`);
        links.push(null);
      }
    }

    console.log(`总共获取 ${links.length} 个链接`);
    return { links };
  } catch (error) {
    console.error('获取详情链接错误:', error);
    return { links: [], error: error.message };
  }
}

// 自动匹配列表项（当未指定 container 时使用）
function scrapeListPageAuto(fieldConfig) {
  try {
    const data = [];
    const selectors = Object.values(fieldConfig);
    const firstSelector = selectors[0].split('@')[0];

    // 尝试找到所有可能的列表项
    let listItems = [];

    // 策略1: 查找公共父级
    const commonPrefixes = findCommonPrefix(selectors.map(s => s.split('@')[0]));

    if (commonPrefixes) {
      const containers = document.querySelectorAll(commonPrefixes);
      if (containers.length > 0) {
        listItems = Array.from(containers);
      }
    }

    // 策略2: 通过第一个选择器找到所有匹配项的父级
    if (listItems.length === 0) {
      const elements = document.querySelectorAll(firstSelector);
      if (elements.length > 0) {
        const parent = elements[0].parentElement;
        if (parent) {
          listItems = Array.from(parent.children);
        }
      }
    }

    // 策略3: 简单方式 - 直接按索引匹配
    if (listItems.length === 0) {
      const maxItems = Math.max(...Object.values(fieldConfig).map(selector => {
        const s = selector.split('@')[0];
        return document.querySelectorAll(s).length;
      }));

      for (let i = 0; i < maxItems; i++) {
        const item = {};
        let hasData = false;

        for (const [fieldName, selector] of Object.entries(fieldConfig)) {
          let actualSelector = selector;
          let attribute = null;

          if (selector.includes('@')) {
            const parts = selector.split('@');
            actualSelector = parts[0];
            attribute = parts[1];
          }

          const elements = document.querySelectorAll(actualSelector);
          if (elements[i]) {
            hasData = true;
            if (attribute) {
              item[fieldName] = elements[i].getAttribute(attribute) || '';
            } else {
              item[fieldName] = elements[i].textContent.trim();
            }
          } else {
            item[fieldName] = null;
          }
        }

        if (hasData) {
          data.push(item);
        }
      }

      return { data };
    }

    // 遍历每个列表项
    for (const listItem of listItems) {
      const item = {};
      let hasData = false;

      for (const [fieldName, selector] of Object.entries(fieldConfig)) {
        let actualSelector = selector;
        let attribute = null;

        if (selector.includes('@')) {
          const parts = selector.split('@');
          actualSelector = parts[0];
          attribute = parts[1];
        }

        const element = listItem.querySelector(actualSelector);

        if (element) {
          hasData = true;
          if (attribute) {
            item[fieldName] = element.getAttribute(attribute) || '';
          } else {
            item[fieldName] = element.textContent.trim();
          }
        } else {
          item[fieldName] = null;
        }
      }

      if (hasData) {
        data.push(item);
      }
    }

    return { data };
  } catch (error) {
    return { error: error.message };
  }
}

// 查找选择器的公共前缀
function findCommonPrefix(selectors) {
  if (selectors.length === 0) return '';

  const parts = selectors.map(s => s.split(/[\s>+~]/));
  const minLength = Math.min(...parts.map(p => p.length));

  let commonPrefix = '';

  for (let i = 0; i < minLength - 1; i++) {
    const part = parts[0][i];
    if (parts.every(p => p[i] === part)) {
      commonPrefix += (commonPrefix ? ' ' : '') + part;
    } else {
      break;
    }
  }

  return commonPrefix;
}

// 点击下一页按钮
function clickNextButton(selector) {
  try {
    const button = document.querySelector(selector);

    if (!button) {
      return { success: false, error: '未找到下一页按钮' };
    }

    // 检查按钮是否可点击
    if (button.disabled || button.classList.contains('disabled')) {
      return { success: false, error: '下一页按钮已禁用' };
    }

    // 滚动到按钮位置
    button.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // 等待滚动完成后点击
    setTimeout(() => {
      button.click();
    }, 300);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
