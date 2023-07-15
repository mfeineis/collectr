/** @param {Window} window */
export function configureEnv(window) {
    if (window.__TAURI__) {
        return window.__TAURI__;
    }
    window.document.querySelector("html").classList.add("env-other");
    return {
        tauri: {
            invoke(fn) {
                throw new Error(`invoke("${fn}") cannot be run in this environment.`)
            },
        },
    }
}