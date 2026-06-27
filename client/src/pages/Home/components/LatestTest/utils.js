import {t} from "i18next";

export function generateRelativeTime(created) {
    let currentDate = new Date().getTime();
    let date = new Date(Date.parse(created)).getTime();

    const diff = (currentDate - date) / 1000;

    if (diff < 5) {
        return t("time.now");
    } else if (diff < 60) {
        return t("time.seconds", {replace: {seconds: Math.floor(diff)}});
    } else if (diff < 3600) {
        return Math.floor(diff / 60) === 1 ? t("time.minute") : t("time.minutes", {replace: {minutes: Math.floor(diff / 60)}});
    } else if (diff < 86400) {
        return Math.floor(diff / 3600) === 1 ? t("time.hour") : t("time.hours", {replace: {hours: Math.floor(diff / 3600)}});
    }

    const days = Math.floor(diff / 86400);
    return days === 1 ? t("time.day") : t("time.days", {replace: {days: days}});
}