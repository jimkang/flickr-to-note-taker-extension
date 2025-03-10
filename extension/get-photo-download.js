var mediaBuffer;

browser.runtime.onMessage.addListener(onMessage);

function onMessage(msg) {
  console.log('got msg', msg);
  if (msg.command === 'start') {
    var dlMenuLink = document.querySelector('a[title="Download this photo"]');
    if (dlMenuLink) {
      showDlMenu(dlMenuLink);
    } else {
      let dlLink = document.querySelector('a[title="Download this video"]');
      if (dlLink) {
        // The download, if it comes from an iPhone, might not have a type playable
        // by a browser. However, the video element will have been converted to
        // play in the browser.
        let videoEl = document.querySelector('video.vjs-tech');
        if (videoEl) {
          getMediaDownload(videoEl.src, 'video/mp4');
        } else {
          console.error(new Error('Could not find video element.'));
        }
      } else {
        setTimeout(showDlMenu, 1000);
      }
    }
  }
}

async function showDlMenu(dlMenuLink) {
    dlMenuLink.click();
    await new Promise((resolve) => setTimeout(resolve, 500));
    let dlLink = document.querySelector('li.Large a');
    let url = 'https:' + dlLink.getAttribute('href');
    setTimeout(getMediaDownload, 1000, url, 'image/jpeg');
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
      let filename = getLastPart(url).replace(/[\?=]/g, '_');
      if (type === 'video/mp4') {
        filename = getLastPart(url);
        if (filename.includes('?')) {
          filename = filename.split('?')[0];
        }
      }
      await browser.runtime.sendMessage({ mediaBuffer, type, filename });
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
