var mediaBuffer;

browser.runtime.onMessage.addListener(onMessage);

function onMessage(msg) {
  console.log('got msg', msg);
  if (msg.command === 'start') {
    showDlMenu();
  }
}

async function showDlMenu() {
  var dlMenuLink = document.querySelector('a[title="Download this photo"]');
  if (dlMenuLink) {
    dlMenuLink.click();
    await new Promise((resolve) => setTimeout(resolve, 500));
    let dlLink = document.querySelector('li.Large a');
    let url = 'https:' + dlLink.getAttribute('href');
    setTimeout(getMediaDownload, 1000, url, 'image/jpeg');
  } else {
    let dlLink = document.querySelector('a[title="Download this video"]');
    if (dlLink) {
      let url = 'https://flickr.com' + dlLink.getAttribute('href');
      setTimeout(getMediaDownload, 1000, url, 'video/mp4');
    } else {
      setTimeout(showDlMenu, 1000);
    }
  }
}

async function getMediaDownload(url, type) {
  console.log('url', url, 'type', type);

  if (url) {
    try {
      let res = await fetch(url, { mode: 'cors' });
      if (!res.ok) {
        console.error(new Error('Could not fetch ' + url + ' status: ' + res.status));
      } else {
        mediaBuffer = await res.arrayBuffer();
        console.log('read media length:', mediaBuffer.byteLength);
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (!mediaBuffer) {
    setTimeout(getMediaDownload, 1000);
  } else {
    // let port = browser.runtime.connect();
    try {
      await browser.runtime.sendMessage({ mediaBuffer, type, filename: getLastPart(url) });
    } catch (error) {
      console.error(error);
      setTimeout(getMediaDownload, 1000);
    }
  }
}

function getLastPart(url) {
  var parts = url.split('/');
  if (parts.length > 0) {
    return parts[parts.length - 1];
  }
}
