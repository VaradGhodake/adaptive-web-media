'use strict';

const videoUrl = 'video/bunny.webm';
const videoSize = 27146030;
const chunkSize = videoSize / 100;

var video = document.querySelector('video');
var mediaSource = new MediaSource();

video.src = URL.createObjectURL(mediaSource);

// declare chunk counter
let chunk_count = 1;

// create table
let download_table = document.createElement('table');
download_table.setAttribute("id", "table");
download_table.style.border="2px solid"
document.body.appendChild(download_table);

// add table header
let header_element = download_table.createTHead();
var header = header_element.insertRow(0);

let count_cell = header.insertCell(0);
let download_cell = header.insertCell(1);

count_cell.innerHTML = "<b> Chunk Number </b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
download_cell.innerHTML = "<b> Download time (in miliseconds) </b>";

mediaSource.addEventListener('sourceopen', event => {
  let sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp9"');

  (function fetchChunk(startRange, chunk_count) {

    let endRange = startRange + chunkSize - 1;
    let options = {
      headers: {
        'Content-Type': 'video/webm',
        'Range': `bytes=${startRange}-${endRange}`
      }
    };

    // declare start time
    let start_time = new Date();

    return fetch(videoUrl, options)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
      sourceBuffer.appendBuffer(arrayBuffer);
      sourceBuffer.addEventListener('updateend', event => {
        if (!sourceBuffer.updating && mediaSource.readyState == 'open') {
          mediaSource.endOfStream();
        }
      });

      // calculate end time
      let end_time = new Date();
      let total_time = (end_time.getTime() - start_time.getTime());

      // append a row to the download stat table
      let download_table = document.getElementById("table");
      let row = download_table.insertRow();
      let count_cell = row.insertCell(0);
      let download_cell = row.insertCell(1);

      count_cell.innerHTML = chunk_count.toString();
      download_cell.innerHTML = total_time.toString();

      let nextStartRange = endRange + 1;
      if (nextStartRange < videoSize) {
        return fetchChunk(nextStartRange, chunk_count + 1);
      }
    });

  })(0, chunk_count); // Start the recursive call by self calling.
}, { once: true });
