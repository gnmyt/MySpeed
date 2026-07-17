import { postJson } from "../util/http.js";
import { replaceVariables } from "../util/helpers.js";

const defaults = {
    finished: "✨ *A speedtest is finished*\n🏓 `Ping`: %ping% ms (±%jitter% ms)\n🔼 `Upload`: %upload% Mbps\n🔽 `Download`: %download% Mbps",
    failed: "❌ *A speedtest has failed*\n`Reason`: %error%"
};

const send = (token, chat_id, text, activity, topic_id) =>
    postJson(`https://api.telegram.org/bot${token}/sendMessage`,
        {text, chat_id, parse_mode: "markdown", ...(topic_id ? {message_thread_id: topic_id} : {})}, {activity});

export default (registerEvent) => {
    registerEvent('testFinished', async ({data: c}, data, activity) => {
        if (c.send_finished) await send(c.token, c.chat_id,
            replaceVariables(c.finished_message || defaults.finished, data), activity, c.topic_id);
    });

    registerEvent('testFailed', async ({data: c}, error, activity) => {
        if (c.send_failed) await send(c.token, c.chat_id,
            replaceVariables(c.failed_message || defaults.failed, {error}), activity, c.topic_id);
    });

    return {
        icon: "fa-brands fa-telegram",
        fields: [
            {name: "token", type: "text", required: true, regex: /(\d+):[a-zA-Z0-9_-]+/},
            {name: "chat_id", type: "text", required: true, regex: /\d+/},
            {name: "topic_id", type: "text", required: false, regex: /^\d+$/},
            {name: "send_finished", type: "boolean", required: false},
            {name: "finished_message", type: "textarea", required: false},
            {name: "send_failed", type: "boolean", required: false},
            {name: "error_message", type: "textarea", required: false}
        ]
    };
};
