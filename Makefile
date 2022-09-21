wasmify:
	echo $(cat $HOME/go/misc/wasm/wasm_exec.js)

compile:
	cd nova && make compile