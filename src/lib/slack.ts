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
  // const previous = new Date(now.setDate(now.getDate() - 1));
  const previous = new Date(now.setMinutes(now.getMinutes() - 1)); // 1分前

  // 24時間前の日時がKVに保存されている日時よりも新しい場合はSlackに通知する
  if (lastNotificationDate ?? now < previous) {
    await axios.post(
      SLACK_WEBHOOK_URL,
      {
        message: error.message,
        time: (lastNotificationDate ?? now).toDateString(),
      },
      { headers: { "Content-Type": "application/json" } }
    );

    // KVにSlackの通知の最終更新日時を保存する
    await kv.set("lastNotificationDate", now);
  }
};
