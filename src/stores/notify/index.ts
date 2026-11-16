import type { TLotteryInfo } from "@/types";
import { formatAnchorLotText, formatRedPocketListTextList, getMaxEndTime } from "../lottery";
import { openLiveRoomManager } from "../openLiveRoom";
import { lotteryIdDeduplication } from "../lotteryIdDeduplication";

const notifyStore = () => {
  let messageHandler: ((event: MessageEvent) => void) | null = null;

  const sendNotify = async (item: TLotteryInfo, type: string) => {
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
      data: item,
      tag: `room-${room_id}`,
      lang: "zh-CN",
      requireInteraction: false,
      renotify: true,
      silent: false,
      vibrate: [200, 100, 200],
      actions: [
        { action: "open", title: "打开直播间" },
        { action: "ignore", title: "忽略" },
      ],
    });
  };

  const requestNotifyPermission = async (): Promise<boolean> => {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;

    return (await Notification.requestPermission()) === "granted";
  };

  const registerServiceWorker = async (): Promise<boolean> => {
    if (!("serviceWorker" in navigator)) return false;

    try {
      let registration = await navigator.serviceWorker.getRegistration("/");
      if (!registration) registration = await navigator.serviceWorker.register("/notifySw.js");

      await navigator.serviceWorker.ready;
      registerMessageListener();

      console.log("Service Worker 注册成功:", registration.scope);
      return true;
    } catch (err) {
      console.error("Service Worker 注册失败:", err);
      return false;
    }
  };

  const registerMessageListener = () => {
    if (messageHandler) return;

    messageHandler = (event: MessageEvent<TLotteryInfo>) => {
      const lot = event.data;
      if (!lot?.room_id) return;

      lotteryIdDeduplication.addLotteryData(lot);
      openLiveRoomManager.openLiveRoom(lot.room_id, getMaxEndTime(lot));
    };

    navigator.serviceWorker.addEventListener("message", messageHandler);
  };

  return {
    sendNotify,
    requestNotifyPermission,
    registerServiceWorker
  };
};

export const notify = notifyStore();