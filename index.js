let NUM_O_FANS;
let N_FFT;
let HOP_LENGTH;
let TIME_WINDOW;
let FINAL_SAMPLE_RATE;
let INBETWEEN_SAMPLE_RATE;
let DB_CUTOFF_VAL;
let PLOT_SEARCH_SIZE;
let FRAME_WIDTH_T;
let SERVER_HOSTNAME="http://localhost"
let SERVER_PORT=9090

function main(wasm){
  console.log(wasm)
}

function get_consts(wasm) {
  let data;
  let xhr = new XMLHttpRequest()
  xhr.open("GET", SERVER_HOSTNAME + ":" + SERVER_PORT + "/get_info", true)
  xhr.onload = function() {
    if (this.status >= 200 && this.status < 300) {
      try {
          data = JSON.parse(this.response);
      } catch(err) {
        console.error("error: ", err)
        return
      }
      console.log(data)
      NUM_O_FANS = data.numoffans
      N_FFT = data.n_fft
      HOP_LENGTH = data.hoplength
      TIME_WINDOW = data.timewindow
      FINAL_SAMPLE_RATE = data.finalsamplerate
      INBETWEEN_SAMPLE_RATE = data.inbetweensamplerate
      DB_CUTOFF_VAL = data.dbcutoffval
      PLOT_SEARCH_SIZE = data.plotsearchsize
      FRAME_WIDTH_T = HOP_LENGTH/FINAL_SAMPLE_RATE
      main(wasm);
    } else {
      console.error("not a 200 http status code")
      return
    }
  }
  xhr.send()
}

async function loadWasm() {
  try {
    const response = await fetch("./libkissfft-float.wasm");
    const bytes = await response.arrayBuffer();
    const { instance } = await WebAssembly.instantiate(bytes, {});
    instance.exports._initialize?.();

    get_consts(instance.exports)

  } catch (err) {
    console.error(err);
  }
}
loadWasm();
