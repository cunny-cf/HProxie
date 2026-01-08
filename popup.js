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

function updateCurrentIp() {
  fetch("https://api.ipify.org?format=text&rand=" + Date.now(), { cache: "no-store" })
    .then(res => res.text())
    .then(ip => {
      document.querySelector(".current-ip").textContent = "Current IP: " + ip;
    })
    .catch(() => {
      document.querySelector(".current-ip").textContent = "Unable to fetch IP";
    });
}

function updateButtonVisuals(btn, isConnected) {
  btn.textContent = isConnected ? "Disconnect" : "Connect";

  if (isConnected) {
    btn.classList.add("connected");
    btn.classList.remove("disconnected");
  } else {
    btn.classList.add("disconnected");
    btn.classList.remove("connected");
  }
}

document.getElementById('toggle-proxy').addEventListener('click', () => {
  const btn = document.getElementById('toggle-proxy');
  chrome.storage.sync.get(['isConnected'], (data) => {
    const newState = !data.isConnected;

    chrome.storage.sync.set({ isConnected: newState }, () => {
      updateButtonVisuals(btn, newState);

      chrome.runtime.sendMessage({ type: newState ? 'setProxy' : 'clearProxy' });

      setTimeout(updateCurrentIp, 1000);
    });
  });
});