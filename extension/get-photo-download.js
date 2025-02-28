var imageBuffer;

browser.runtime.onMessage.addListener(onMessage);

function onMessage(msg) {
  console.log('got msg', msg);
  if (msg.command === 'start') {
    showDlMenu();
  }
}

function showDlMenu() {
  var dlMenuLink = document.querySelector('a[title="Download this photo"]');
  if (dlMenuLink) {
    dlMenuLink.click();
    setTimeout(getPhotoDownload, 1000);
  } else {
    setTimeout(showDlMenu, 1000);
  }
}

async function getPhotoDownload() {
  var dlLink = document.querySelector('li.Large a');
  if (dlLink) {
    const url = 'https:' + dlLink.getAttribute('href');
    console.log('url', url);
    try {
      let res = await fetch(url, { mode: 'cors' });
      if (!res.ok) {
        console.error(new Error('Could not fetch ' + url + ' status: ' + res.status));
      } else {
        imageBuffer = await res.arrayBuffer();
        console.log('read image length:', imageBuffer.byteLength);
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (!imageBuffer) {
    setTimeout(getPhotoDownload, 1000);
  } else {
    // let port = browser.runtime.connect();
    try {
      await browser.runtime.sendMessage({ imageBuffer });
    } catch (error) {
      console.error(error);
      setTimeout(getPhotoDownload, 1000);
    }
  }
}

