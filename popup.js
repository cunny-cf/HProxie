document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['proxyIp', 'proxyPort', 'isConnected'], (data) => {
    if (data.proxyIp) document.getElementById('proxy-ip').value = data.proxyIp;
    if (data.proxyPort) document.getElementById('proxy-port').value = data.proxyPort;

    const btn = document.getElementById('toggle-proxy');
    const isConnected = data.isConnected || false;
    updateButtonVisuals(btn, isConnected);
  });

  updateCurrentIp();

  startPingLoop();
});

function startPingLoop() {
  const pingElement = document.querySelector(".current-ping");

  async function performPing() {
    let pingUrl = "https://www.google.com/generate_204";
    let targetName = "Google";

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.startsWith("http")) {
        const urlObj = new URL(tab.url);
        pingUrl = `${urlObj.origin}/favicon.ico`;
        targetName = urlObj.hostname;
      }

      const start = performance.now();
      await fetch(`${pingUrl}?t=${Date.now()}`, { mode: 'no-cors', cache: "no-store" });
      const end = performance.now();
      
      const ms = Math.round(end - start);
      pingElement.textContent = `Ping (${targetName}): ${ms}ms`;
      
      if (ms < 150) pingElement.style.color = "#4CAF50";     
      else if (ms < 400) pingElement.style.color = "#FFC107"; 
      else pingElement.style.color = "#F44336";               

    } catch (err) {
      pingElement.textContent = `Ping (${targetName}): Offline`;
      pingElement.style.color = "#F44336";
    }

    setTimeout(performPing, 1000);
  }

  performPing();
}

function updateCurrentIp() {
  fetch(`https://ipwho.is/?rand=${Date.now()}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.querySelector(".current-ip").textContent = `Current IP: ${data.ip}`;
        document.querySelector(".current-country").textContent = `Current Country: ${data.country} | ${data.country_code}`;
      }
    })
    .catch(() => {
      document.querySelector(".current-ip").textContent = "Unable to fetch IP";
    });
}

function updateButtonVisuals(btn, isConnected) {
  btn.textContent = isConnected ? "DISCONNECT" : "CONNECT";
  btn.className = isConnected ? "connected" : "disconnected"; 
}

document.getElementById('toggle-proxy').addEventListener('click', () => {
  const btn = document.getElementById('toggle-proxy');
  const currentIp = document.getElementById('proxy-ip').value;
  const currentPort = document.getElementById('proxy-port').value;

  chrome.storage.sync.get(['isConnected'], (data) => {
    const newState = !data.isConnected;

    chrome.storage.sync.set({ 
      isConnected: newState,
      proxyIp: currentIp,
      proxyPort: currentPort
    }, () => {
      updateButtonVisuals(btn, newState);
      chrome.runtime.sendMessage({ type: newState ? 'setProxy' : 'clearProxy' });

      setTimeout(updateCurrentIp, 1500);
    });
  });
});