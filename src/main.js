import { configureBackend } from "./features/backend/backend.js";
import { configureEnv } from "./features/env/env.js";

const env = configureEnv(self);
const query = configureBackend(env);

console.log("env", env);

let greetInputEl;
let greetMsgEl;

async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    greetMsgEl.textContent = await env.tauri.invoke("greet", { name: greetInputEl.value });
}

window.addEventListener("DOMContentLoaded", () => {
    greetInputEl = document.querySelector("#greet-input");
    greetMsgEl = document.querySelector("#greet-msg");
    document
        .querySelector("#greet-button")
        .addEventListener("click", () => greet());

    let dirHistory = localStorage.getItem("dirHistory") ?? "[]";
    dirHistory = JSON.parse(dirHistory);

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
        localStorage.setItem("dirHistory", JSON.stringify(dirHistory));

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