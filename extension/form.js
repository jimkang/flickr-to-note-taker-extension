browser.runtime.onMessage.addListener(onMessage);
var statusEl = document.getElementById('status');

statusEl.textContent = 'Waiting.';

function onMessage({ mediaBuffer, type }) {
  statusEl.textContent = 'Got buffer with length ' + mediaBuffer.byteLength + ', type: ' + type;
}

async function messageDownloader() {
  try {
    var activeTabs = await browser.tabs.query({ active: true });
    var tab = activeTabs[0];
    await browser.tabs.sendMessage(tab.id, { command: 'start' });
  } catch (error) {
    console.error(error);
    statusEl.textContent = error.message + ' tab ' + tab.id;
  }
}

messageDownloader();
