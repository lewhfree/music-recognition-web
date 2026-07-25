async function loadWasm() {
  try {
    const response = await fetch("./libkissfft-float.wasm");
    const bytes = await response.arrayBuffer();
    const { instance } = await WebAssembly.instantiate(bytes, {});
    instance.exports._initialize?.();

    console.log("Loaded wasm exports::",Object.keys(instance.exports));
    window.wasm = instance.exports;

  } catch (err) {
    console.error(err);
  }
}
loadWasm();
