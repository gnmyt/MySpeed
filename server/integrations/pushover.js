import { postJson } from "../util/http.js";
import { replaceVariables } from "../util/helpers.js";

const URL = "https://api.pushover.net/1/messages.json";

const defaults = {
    finished: "A speedtest is finished:\nPing: %ping% ms (±%jitter% ms)\nUpload: %upload% Mbps\nDownload: %download% Mbps",
    failed: "A speedtest has failed. Reason: %error%"
};

const send = ({token, user_key}, message, activity) =>
    postJson(URL, {token, user: user_key, message}, {activity});

export default (registerEvent) => {
    registerEvent('testFinished', async ({data: c}, data, activity) => {
        if (c.send_finished) await send(c,
            replaceVariables(c.finished_message || defaults.finished, data), activity);
    });

    registerEvent('testFailed', async ({data: c}, error, activity) => {
        if (c.send_failed) await send(c,
            replaceVariables(c.error_message || defaults.failed, {error}), activity);
    });

    return {
        icon: "fa-solid fa-pushover",
        fields: [
            {name: "token", type: "text", required: true, regex: /^[A-Za-z0-9]{30}$/},
            {name: "user_key", type: "text", required: true, regex: /^[A-Za-z0-9]{30}$/},
            {name: "send_finished", type: "boolean", required: false},
            {name: "finished_message", type: "textarea", required: false},
            {name: "send_failed", type: "boolean", required: false},
            {name: "error_message", type: "textarea", required: false}
        ]
    };
};
