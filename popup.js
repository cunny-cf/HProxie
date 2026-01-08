document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['proxyIp', 'proxyPort', 'isConnected'], (data) => {
    if (data.proxyIp) document.getElementById('proxy-ip').value = data.proxyIp;
    if (data.proxyPort) document.getElementById('proxy-port').value = data.proxyPort;

    const btn = document.getElementById('toggle-proxy');
    const isConnected = data.isConnected || false;
    updateButtonVisuals(btn, isConnected);
  });

  updateCurrentIp();
});

async function updateCurrentIp() {
  const ipElement = document.querySelector(".current-ip");
  const countryElement = document.querySelector(".current-country");
  const pingElement = document.querySelector(".current-ping"); 

  try {
    // 1. Get IP and Country Data
    const res = await fetch(`https://ipwho.is/?rand=${Date.now()}`);
    const data = await res.json();

    if (data.success) {
      ipElement.textContent = `Current IP: ${data.ip}`;
      countryElement.textContent = `Current Country: ${data.country} | ${data.country_code}`;
      
      const startTime = performance.now();
      
      await fetch("https://www.google.com/generate_204", { 
        mode: 'no-cors', 
        cache: 'no-store' 
      });

      const endTime = performance.now();
      const pingTime = Math.round(endTime - startTime);
      
      pingElement.textContent = `Ping to Google: ${pingTime}ms`;
    }
  } catch (error) {
    ipElement.textContent = "Connection Error";
    pingElement.textContent = "Ping: ---";
  }
}

function updateButtonVisuals(btn, isConnected) {
  btn.textContent = isConnected ? "Disconnect" : "Connect";
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