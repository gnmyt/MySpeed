import { postJson } from "../util/http.js";
import { replaceVariables } from "../util/helpers.js";

const defaults = {
    finished: "A speedtest is finished:\nPing: %ping% ms (±%jitter% ms)\nUpload: %upload% Mbps\nDownload: %download% Mbps",
    failed: "A speedtest has failed. Reason: %error%"
};

const send = ({url, key}, message, priority, activity) =>
    postJson(`${url}/message`, {message, priority: parseInt(priority)},
        {headers: {"Authorization": "Bearer " + key}, activity});

export default (registerEvent) => {
    registerEvent('testFinished', async ({data: c}, data, activity) => {
        if (c.send_finished) await send(c,
            replaceVariables(c.finished_message || defaults.finished, data), c.priority, activity);
    });

    registerEvent('testFailed', async ({data: c}, error, activity) => {
        if (c.send_failed) await send(c,
            replaceVariables(c.failed_message || defaults.failed, {error}), 8, activity);
    });

    return {
        icon: "fa-solid fa-bell",
        fields: [
            {name: "url", type: "text", required: true, regex: /https?:\/\/.+/},
            {name: "key", type: "text", required: true, regex: /^.{15,}$/},
            {name: "priority", type: "text", required: true, regex: /^[0-9]$/},
            {name: "send_finished", type: "boolean", required: false},
            {name: "finished_message", type: "textarea", required: false},
            {name: "send_failed", type: "boolean", required: false},
            {name: "error_message", type: "textarea", required: false}
        ]
    };
};
