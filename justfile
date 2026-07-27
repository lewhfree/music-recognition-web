all:
    make TARGET=wasm32-wasi KISSFFT_STATIC=1 -Cc-fft/ -s
    zig cc -target wasm32-wasi \
    -Wl,--no-entry \
    -mexec-model=reactor \
    -Wl,--whole-archive \
    c-fft/libkissfft-float.a \
    -Wl,--no-whole-archive \
    -Wl,--export-dynamic \
    -Wl,--export=malloc \
    -Wl,--export=free \
    -o libkissfft-float.wasm

deps:
    rm -rf c-fft
    # git clone https://github.com/lewhfree/c-fft
    cp -r ../c-fft .

clean:
    make -Cc-fft/ clean
    rm libkissfft-float.wasm -f 
