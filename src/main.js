import { configureBackend } from "./features/backend/backend.js";
import { configureEnv } from "./features/env/env.js";
import { LocalStore } from "./features/store/store.js";

const env = configureEnv(self);
const query = configureBackend(env);
const store = new LocalStore();

console.log("env", env);

window.addEventListener("DOMContentLoaded", () => {

    const dirHistory = store.getItem("dirHistory", []);

    const ctrl = new AbortController();

    const select = document.querySelector("#select-dir-history");
    select.innerHTML = (["-"].concat(dirHistory))
        .sort()
        .map(it => `<option value="${it}">${it}</option>`)
        .join("");

    const artistList = document.querySelector("#artists");

    select.addEventListener("change", async (ev) => {
        select.disabled = true;

        const value = ev.target.value;
        const { data } = await query({
            source: `#graphql

                query ($dir: String!) {
                    artists(dir: $dir) {
                        id
                        name
                        albums {
                            id
                            name
                            path
                            year
                        }
                    }
                }

            `,
            variableValues: {
                dir: value,
            },
        });
        console.log("artists", data);
        artistList.innerHTML = data.artists
            .map(({ id, name }) => `<option value="${id}">${name}</option>`)
            .join("");

        select.disabled = false;
    }, { signal: ctrl.signal });

    artistList.addEventListener("change", async (ev) => {
        console.log("artistList.onchange", ev.target.value, ev.target, ev.currentTarget, ev);
    }, { signal: ctrl.signal });

    const btnOpenDir = document.querySelector("#btn-open-dir");
    btnOpenDir.addEventListener("click", async (ev) => {
        ev.preventDefault();

        const dir = await env.dialog.open({
            directory: true,
        });
        dirHistory.push(dir);
        store.setItem("dirHistory", dirHistory);

        select.innerHTML = (["-"].concat(dirHistory))
            .sort()
            .map(it => `<option value="${it}">${it}</option>`)
            .join("");

    }, { signal: ctrl.signal });

});

async function gqlDemo() {
    const queryResult = await query({
        source: "{ hello }",
    });
    const mutationResult = await query({
        source: `#graphql
            mutation($name: String!) {
                rememberMyName(name: $name)
            }
        `,
        variableValues: {
            name: "Professor X",
        },
    })
    console.log(queryResult, mutationResult);
}

gqlDemo();