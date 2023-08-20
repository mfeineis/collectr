
declare interface QueryFacade<T = unknown> {
    (args: {
        source: string,
        variableValues: { readonly [variable: string]: unknown },
    }): Promise<{
        data: T,
        errors: Error[],
    }>;
}

declare interface Artist {
    id: string,
    name: string,
    albums: Album[],
}

declare interface Album {
    id: string,
    name?: string,
    path: string,
    year?: number,
    songs?: Song[],
}

declare interface Song {
    id: string,
    name?: string,
    path: string,
    track?: number,
}

declare interface EnvFacade {
    invoke(fn: "find_artists", { dir: string }): Promise<Artist[]>,
    invoke(fn: "greet", { name: string }): Promise<string>,
}

declare interface TauriGlobal {
    tauri: EnvFacade,
}

declare interface Window {
    __TAURI__: TauriGlobal,
}