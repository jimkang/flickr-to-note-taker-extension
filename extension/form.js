const apiServerBaseURL = 'https://smidgeo.com/note-taker/note';
// const apiServerBaseURL = 'http://localhost:5678/note';
var lineBreakRegex = /\n/g;

var buffer;
var mediaType;
var mediaFilename;
var statusEl = document.getElementById('status');

statusEl.textContent = 'Waiting.';
document.getElementById('popup-url').textContent = window.location.href;
document.querySelector('.submit-note-button').addEventListener('click', onSubmitClick);

browser.runtime.onMessage.addListener(onMessage);
messageDownloader();

function onMessage({ mediaBuffer, type, filename }) {
  buffer = mediaBuffer;
  mediaType = type;
  mediaFilename = filename;

  statusEl.textContent = 'Media with length ' + buffer.byteLength + ' and type ' + mediaType + ' is ready to post.';

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

async function onSubmitClick() {
  statusEl.textContent = 'Posting...';

  const archive = document.querySelector('#archive').value;
  const password = document.querySelector('#password').value;
  const caption = document.querySelector('.note-area').value.replace(lineBreakRegex, '<br>');
  const altText = document.querySelector('.alt-text').value;

  var reqOpts = {
    method: 'POST',
    headers: {
      Authorization: `Key ${password}`,
      'X-Note-Archive': archive,
    },
  };

  if (buffer) {
    let formData = new FormData();
    formData.append('archive', archive);
    formData.append('caption', caption);
    formData.append('buffer0', new Blob([buffer], { type: mediaType }));
    formData.append('mediaFiles', JSON.stringify([
      {
        filename: mediaFilename,
        alt: altText,
        mimeType: mediaType,
        isVideo: mediaType.startsWith('video/'),
        isAudio: mediaType.startsWith('audio/')
      }
    ]));
    reqOpts.body = formData;
  } else {
    reqOpts.headers['Content-Type'] = 'application/json';
    reqOpts.body = { archive, caption };
  }
  try {
    let res = await fetch(apiServerBaseURL, reqOpts);
    if (res.ok) {
      statusEl.textContent = 'Post success!';
    } else {
      statusEl.textContent = `Got ${res.status} when trying to post.`;
    }
  } catch (error) {
    statusEl.textContent = `Got error ${error.message} when trying to post.`;
  }
}

