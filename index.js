let NUM_O_FANS;
let N_FFT;
let HOP_LENGTH;
let TIME_WINDOW;
let FINAL_SAMPLE_RATE;
let INBETWEEN_SAMPLE_RATE;
let DB_CUTOFF_VAL;
let PLOT_SEARCH_SIZE;
let FRAME_WIDTH_T;
let SERVER_HOSTNAME = "http://localhost"
let SERVER_PORT = 9090

async function main() {
  let data = await blockingHttp(SERVER_HOSTNAME + ":" + SERVER_PORT + "/get_info", {}, "GET")
  data = JSON.parse(data)

  NUM_O_FANS = data.numoffans
  N_FFT = data.n_fft
  HOP_LENGTH = data.hoplength
  TIME_WINDOW = data.timewindow
  FINAL_SAMPLE_RATE = data.finalsamplerate
  INBETWEEN_SAMPLE_RATE = data.inbetweensamplerate
  DB_CUTOFF_VAL = data.dbcutoffval
  PLOT_SEARCH_SIZE = data.plotsearchsize
  FRAME_WIDTH_T = HOP_LENGTH / FINAL_SAMPLE_RATE
  console.log(data)

  console.log(window.wasm)
  let wasm = window.wasm
  let cfg = wasm.kiss_fftr_alloc(N_FFT, 0, 0, 0);
  console.log("config: ", cfg)
  // nfft * 4 because 4 bytes per float and it takes a list of nfft scalars
  let ptr_fake_data = wasm.malloc(N_FFT * 4)
  const bytes2 = new Float32Array(wasm.memory.buffer, ptr_fake_data, N_FFT)
  let length = bytes2.length
  for (let i = 0; i<length; i++){
    bytes2[i] = Math.sin(2 * Math.PI * 440 * i / FINAL_SAMPLE_RATE);
  }
  // malloc is the nfft/2+1, then kiss_fft_cpx is a struct of two scalars, which are defined as a float in the makefile. A float is 4 bytes, so two is 8
  let ptr_freqdata = wasm.malloc(((N_FFT/2)+1) * 8)
  wasm.kiss_fftr(cfg, ptr_fake_data, ptr_freqdata)
  const arrayView = new Float32Array(wasm.memory.buffer, ptr_freqdata, ((N_FFT/2)+1)*2)
  const array = arrayView.slice();
  console.log(array);

  let ptr_real_output = wasm.malloc((N_FFT/2+1) * 4)
  wasm.lhf_imag_pair_to_real(N_FFT, ptr_freqdata, ptr_real_output)
  
  const arrayView2 = new Float32Array(wasm.memory.buffer, ptr_real_output, (N_FFT/2)+1)
  const array2 = arrayView2.slice();
  console.log(array2);

  wasm.free(ptr_freqdata);
  wasm.free(ptr_fake_data);
  wasm.free(cfg);
}

async function loadWasm() {
  try {
    if (!confirm("continue loading? ~1.5MB")){
      return;
    }
    const response = await fetch("./libkissfft-float.wasm");
    const bytes = await response.arrayBuffer();
    const module = await WebAssembly.compile(bytes);
    console.table(WebAssembly.Module.exports(module));
    console.table(WebAssembly.Module.imports(module));
    const { instance } = await WebAssembly.instantiate(bytes, {});
    instance.exports._initialize?.();
    window.wasm = instance.exports;
    main();

  } catch (err) {
    console.error("cannot load wasm", err);
  }
}
loadWasm();
