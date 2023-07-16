/** @param {EnvFacade} env */
export function configureResolvers({ invoke }) {
    const Query = {
        hello: () => "Hello, World!",
        artists: async ({ dir }) => {
            console.log("Query.artists", { dir });
            try {
                return await invoke("find_artists", { dir });
            } catch (e) {
                console.error(e);
                return [];
            }
        },
    };
    const Mutation = {
        rememberMyName: ({ name }) => {
            return name;
        },
    };

    return {
        ...Query,
        ...Mutation,
    };
}
