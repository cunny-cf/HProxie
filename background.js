chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'setProxy') {
    chrome.storage.sync.get(['proxyIp', 'proxyPort', 'proxyScope'], (data) => {
      const proxyConfig = {
        mode: 'fixed_servers',
        rules: {
          singleProxy: {
            scheme: 'http',
            host: data.proxyIp,
            port: parseInt(data.proxyPort, 10)
          },
          bypassList: []
        }
      };
      chrome.proxy.settings.set({ value: proxyConfig, scope: 'regular' }, () => { });
    });
  } else if (message.type === 'clearProxy') {
    chrome.proxy.settings.clear({ scope: 'regular' }, () => { });
  }
});
