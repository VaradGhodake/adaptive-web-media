'use strict';

const videoUrl = 'video/bunny.webm';
const videoSize = 27146030;
const chunkSize = videoSize / 100;

var video = document.querySelector('video');
var mediaSource = new MediaSource();

video.src = URL.createObjectURL(mediaSource);

mediaSource.addEventListener('sourceopen', event => {
  let sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp9"');

  // declare sleep
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  (function fetchChunk(startRange, back_to_back) {
    let endRange = startRange + chunkSize - 1;
    let options = {
      headers: {
        'Content-Type': 'video/webm',
        'Range': `bytes=${startRange}-${endRange}`
      }
    };

    return fetch(videoUrl, options)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
      sourceBuffer.appendBuffer(arrayBuffer);
      sourceBuffer.addEventListener('updateend', event => {
        if (!sourceBuffer.updating && mediaSource.readyState == 'open') {
          mediaSource.endOfStream();
        }
      });

      let nextStartRange = endRange + 1;
      if (nextStartRange < videoSize) {
        if(back_to_back > 1) {
          return fetchChunk(nextStartRange, back_to_back-1);
        } else {

          (async () => {
            // sleep for 6 seconds
            await sleep(6000);
            return fetchChunk(nextStartRange, 0);
          })();
        }
      }
    });

  })(0, 5); // Start the recursive call by self calling.
}, { once: true });
