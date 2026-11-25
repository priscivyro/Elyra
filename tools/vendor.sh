#!/bin/sh
# Copie les moteurs de la voix naturelle (onnxruntime-web + piper-phonemize) dans www/vendor/.
set -e
mkdir -p www/vendor
cp node_modules/onnxruntime-web/dist/ort.wasm.min.js node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm www/vendor/
cp node_modules/@diffusionstudio/piper-wasm/build/piper_phonemize.js node_modules/@diffusionstudio/piper-wasm/build/piper_phonemize.wasm node_modules/@diffusionstudio/piper-wasm/build/piper_phonemize.data www/vendor/
ls -la www/vendor
