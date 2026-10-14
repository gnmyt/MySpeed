import { postJson } from "../util/http.js";
import { replaceVariables } from "../util/helpers.js";

const defaults = {
    finished: ":sparkles: **A speedtest is finished**\n > :ping_pong: `Ping`: %ping% ms (±%jitter% ms)\n > :arrow_up: `Upload`: %upload% Mbps\n > :arrow_down: `Download`: %download% Mbps",
    failed: ":x: **A speedtest has failed**\n > `Reason`: %error%"
};

const send = (url, username, color, description, activity) =>
    postJson(url, {
        content: null, username,
        embeds: [{description, color, footer: {text: "MySpeed"}, timestamp: new Date().toISOString()}]
    }, {activity});

export default (registerEvent) => {
    registerEvent('testFinished', async ({data: c}, data, activity) => {
        if (c.send_finished) await send(c.url, c.display_name || "MySpeed", 4572762,
            replaceVariables(c.finished_message || defaults.finished, data), activity);
    });

    registerEvent('testFailed', async ({data: c}, error, activity) => {
        if (c.send_failed) await send(c.url, c.display_name || "MySpeed", 12993861,
            replaceVariables(c.failed_message || defaults.failed, {error}), activity);
    });

    return {
        icon: "fa-brands fa-discord",
        fields: [
            {name: "url", type: "text", required: true,
                regex: /^https:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api(?:\/v\d+)?\/webhooks\/\d+\/[\w-]+(?:\?\S*)?$/},
            {name: "display_name", type: "text", required: false},
            {name: "send_finished", type: "boolean", required: false},
            {name: "finished_message", type: "textarea", required: false},
            {name: "send_failed", type: "boolean", required: false},
            {name: "error_message", type: "textarea", required: false}
        ]
    };
};
