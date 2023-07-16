
export class Store {
    getItem(key) {}
    setItem(key, value) {}
}

export function configureLocalStore({ JSON, localStorage }) {
    return class LocalStore extends Store {
        getItem(key, defaultValue) {
            const raw = localStorage.getItem(key);
            return raw === null ? defaultValue : JSON.parse(raw);
        }
        setItem(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    };
}

export const LocalStore = configureLocalStore(window);
