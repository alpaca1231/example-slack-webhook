import axios from "axios";
import { kv } from "@vercel/kv";

const SLACK_WEBHOOK_URL = process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL ?? "";

export const notificationErrorToSlack = async (error: Error) => {
  if (!SLACK_WEBHOOK_URL) return;

  // KVからSlackの通知の最終更新日時を取得する
  const lastNotificationDate = await kv.get<Date>("lastNotificationDate");

  // 24時間前の日時を取得する
  const now = new Date();
  const yesterday = new Date(now.setDate(now.getDate() - 1));

  // 24時間前の日時がKVに保存されている日時よりも新しい場合はSlackに通知する
  if (lastNotificationDate && lastNotificationDate < yesterday) {
    await axios.post(
      SLACK_WEBHOOK_URL,
      {
        message: error.message,
      },
      { headers: { "Content-Type": "application/json" } }
    );

    // KVにSlackの通知の最終更新日時を保存する
    await kv.set("lastNotificationDate", now);
  }
};
