import axios from "axios";
import { kv } from "@vercel/kv";

const SLACK_WEBHOOK_URL = process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL ?? "";

export const notificationErrorToSlack = async (error: Error) => {
  if (!SLACK_WEBHOOK_URL) return;

  // KVからSlackの通知の最終更新日時を取得する
  const lastNotification = await kv.get<Date>("lastNotificationDate");
  const lastNotificationDate = lastNotification ? new Date(lastNotification) : null;

  // 24時間前の日時を取得する
  const now = new Date();
  const previous = new Date();
  // previous.setDate(now.getDate() - 1); // 24時間前
  previous.setMinutes(now.getMinutes() - 2); // 2分前

  const body = {
    message: error.message,
    time: now.toDateString(),
  };

  // lastNotificationDateが24時間以上前の場合、Slackに通知する
  if (!lastNotificationDate || lastNotificationDate < previous) {
    await axios.post(SLACK_WEBHOOK_URL, body, { headers: { "Content-Type": "application/json" } });

    // KVにSlackの通知の最終更新日時を保存する
    await kv.set("lastNotificationDate", now);

    return body;
  }
};
