import type { User } from "./user-service.js";

const CREATED_KEY = "created-users";
const UPDATED_KEY = "updated-users";
const DELETED_KEY = "deleted-users";

const readStore = <T>(key: string, fallback: T): T => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) as T : fallback;
    } catch (error) {
        console.error(error);
        return fallback;
    }
}

const writeStore = (key: string, value: unknown) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(error);
    }
}

export const saveCreatedUser = (user: User) => {
    const created = readStore<User[]>(CREATED_KEY, []);
    writeStore(CREATED_KEY, [...created, user]);
}

export const saveUpdatedUser = (user: User) => {
    const updated = readStore<User[]>(UPDATED_KEY, []);
    writeStore(UPDATED_KEY, [...updated.filter((item) => item.id !== user.id), user]);

    const created = readStore<User[]>(CREATED_KEY, []);
    if (created.some((item) => item.id === user.id)) {
        writeStore(CREATED_KEY, created.map((item) => item.id === user.id ? user : item));
    }
}

export const saveDeletedUser = (id: number) => {
    const deleted = readStore<number[]>(DELETED_KEY, []);
    writeStore(DELETED_KEY, [...deleted, id]);

    const created = readStore<User[]>(CREATED_KEY, []);
    writeStore(CREATED_KEY, created.filter((item) => item.id !== id));
}

export const applyLocalChanges = (users: User[]): User[] => {
    const created = readStore<User[]>(CREATED_KEY, []);
    const updated = readStore<User[]>(UPDATED_KEY, []);
    const deleted = readStore<number[]>(DELETED_KEY, []);

    const fromServer = users
        .filter((user) => !deleted.includes(user.id))
        .map((user) => updated.find((item) => item.id === user.id) ?? user);

    return [...created, ...fromServer];
}

export const findLocalUser = (id: number): User | undefined => {
    const created = readStore<User[]>(CREATED_KEY, []);
    const updated = readStore<User[]>(UPDATED_KEY, []);

    return updated.find((item) => item.id === id) ?? created.find((item) => item.id === id);
}
