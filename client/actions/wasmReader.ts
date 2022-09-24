export const initWasm = ()  => {
    // @ts-ignore
    const go = new Go();

    WebAssembly.instantiateStreaming(fetch("/assets/wasm/main.wasm"), go.importObject).then((result) => {
        go.run(result.instance);
    });
}

export const startGo = (data: any) => {
    // @ts-ignore
    return initProject(data);
};