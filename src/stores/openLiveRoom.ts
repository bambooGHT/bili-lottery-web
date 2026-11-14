import type { TAnchorLot, TRedPocket } from "@/types";
import { ref } from "vue";
import { globalTicker } from "./ticker";

const openLiveRoomStore = () => {
  const openedRoomIds = ref(new Map<number, number>());

  const openLiveRoom = (roomId: number, maxEndTime: number) => {
    let v;
    if (isMobile()) v = window.open(`bilibili://live/${roomId}`, "_self");
    else v = window.open(`https://live.bilibili.com/${roomId}`, "_blank");

    if (v) openedRoomIds.value.set(roomId, maxEndTime);
  };

  const deleteOpenedRoomId = (now: number) => {
    now /= 1000;
    for (const [roomId, maxEndTime] of openedRoomIds.value) {
      if (now >= maxEndTime) {
        openedRoomIds.value.delete(roomId);
      }
    }
  };

  const isMobile = () => {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  };

  globalTicker.subscribe(deleteOpenedRoomId);

  return {
    openedRoomIds,
    openLiveRoom
  };
};

export const openLiveRoomManager = openLiveRoomStore();