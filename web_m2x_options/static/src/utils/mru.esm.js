/** @odoo-module **/
import {session} from "@web/session";

const LOCAL_STORAGE_NAME = "web_m2x_options_mru";

export function getMruMaxLength() {
    return (
        parseInt(session.web_m2x_options["web_m2x_options.search_mru_max_length"]) || 5
    );
}

export function isMruGlobalOptionEnabled() {
    return session.web_m2x_options["web_m2x_options.search_mru"] === "True";
}

export function getMruKey(modelName, fieldName) {
    return session.db + "/" + modelName + "/" + fieldName;
}

export function getMruStorage() {
    let data = localStorage.getItem(LOCAL_STORAGE_NAME);
    if (!data) {
        return {};
    }
    data = JSON.parse(data);
    return data;
}

export function getMruValue(mruKey) {
    const data = getMruStorage();
    return mruKey in data ? data[mruKey] : [];
}

export function setMruValue(mruKey, value) {
    const data = getMruStorage();
    data[mruKey] = value;
    localStorage.setItem(LOCAL_STORAGE_NAME, JSON.stringify(data));
}

export function updateMruIds(mruKey, recordId) {
    if (!recordId) {
        return;
    }
    const cachedIds = getMruValue(mruKey);
    const currentIndex = cachedIds.indexOf(recordId);
    if (currentIndex !== -1) {
        cachedIds.splice(currentIndex, 1);
    }
    cachedIds.unshift(recordId);
    const maxLength = getMruMaxLength();
    if (cachedIds.length > maxLength) {
        cachedIds.splice(maxLength, cachedIds.length);
    }
    setMruValue(mruKey, cachedIds);
}

export function updateMruLocalStorageValues(modelName, values) {
    Object.keys(values).forEach(function (key) {
        const mruKey = getMruKey(modelName, key);
        updateMruIds(mruKey, values[key]);
    });
}
