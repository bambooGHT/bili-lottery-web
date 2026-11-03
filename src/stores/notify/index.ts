import type { TAnchorLot, TRedPocket } from "@/types";
import { formatAnchorLotText, formatRedPocketListTextList } from "../lottery";

export type TLotteryNotify = {
  name: string;
  uid: number;
  room_id: number;
  anchorLot: TAnchorLot;
  redPocketList: TRedPocket[];
};

const notifyStore = () => {
  const sendNotify = async (item: TLotteryNotify, type: string) => {
    const registration = await navigator.serviceWorker.ready;

    const { name, uid, room_id, anchorLot, redPocketList } = item;
    const now = Date.now() / 1000;

    let title = "";
    let body = "";
    if (type === "anchorLot") {
      title = "天选";
      body = formatAnchorLotText(now, anchorLot);
    } else {
      title = "红包";
      body = formatRedPocketListTextList(now, uid, redPocketList).join("\n\n");
    }

    await registration.showNotification(`[${title}]  ${name}`, {
      body,
      tag: `room-${room_id}`,
      lang: "zh-CN",
      requireInteraction: false,
      renotify: true,
      silent: false,
      vibrate: [200, 100, 200],
      data: { roomId: room_id },
      actions: [
        { action: "open", title: "打开直播间" },
        { action: "ignore", title: "忽略" },
      ],
    });
  };

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/notifySw.js');
        console.log('Service Worker注册成功:', registration.scope);
      } catch (err) {
        console.error('Service Worker注册失败:', err);
      }
    });
  }

  const requestNotifyPermission = async (): Promise<boolean> => {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;

    return (await Notification.requestPermission()) === "granted";
  };

  return {
    sendNotify,
    requestNotifyPermission
  };
};

export const notify = notifyStore();