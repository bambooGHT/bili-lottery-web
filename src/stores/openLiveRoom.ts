import type { TAnchorLot, TRedPocket } from "@/types";
import { ref } from "vue";
import { globalTicker } from "./ticker";

const openLiveRoomManagerStore = () => {
  const roomCache = new Map<number, {
    anchorLotId?: number;
    redPocketIdList: number[];
    maxEndTime: number;
  }>();

  const openedRoomIds = ref(new Set<number>());

  const autoOpenLiveRoom = (roomId: number, redPocketList?: TRedPocket[], anchorLot?: TAnchorLot) => {
    if (!addRoom(roomId, redPocketList, anchorLot)) return;
    openLiveRoom(roomId);
  };

  const navigateOpenLiveRoom = (roomId: number, redPocketList?: TRedPocket[], anchorLot?: TAnchorLot) => {
    addRoom(roomId, redPocketList, anchorLot);
    openLiveRoom(roomId);
  };

  const openLiveRoom = (roomId: number) => {
    window.open(`https://live.bilibili.com/${roomId}`, "_blank");
  };

  const deleteExpiredLiveRoom = (now: number) => {
    now /= 1000;
    for (const [roomId, item] of roomCache) {
      if (now >= item.maxEndTime) {
        roomCache.delete(roomId);
        openedRoomIds.value.delete(roomId);
      }
    }

  };

  const addRoom = (roomId: number, redPocketList?: TRedPocket[], anchorLot?: TAnchorLot) => {
    const maxEndTime = Math.max(
      anchorLot?.end_time ?? 0,
      ...(redPocketList?.map(item => item.end_time) ?? [])
    );
    const newData = {
      anchorLotId: anchorLot?.id,
      redPocketIdList: (redPocketList ?? []).map(p => p.lot_id),
      maxEndTime
    };
    const cachedData = roomCache.get(roomId);

    if (cachedData) {
      const anchorLotChanged = newData.anchorLotId && newData.anchorLotId !== cachedData.anchorLotId;
      const cachedRedPocketIds = new Set(cachedData.redPocketIdList);
      const hasNewRedPocket = newData.redPocketIdList.some(id => !cachedRedPocketIds.has(id));

      if (!anchorLotChanged && !hasNewRedPocket) return false;
    }

    roomCache.set(roomId, newData);
    openedRoomIds.value.add(roomId);

    return true;
  };

  globalTicker.subscribe(deleteExpiredLiveRoom);

  return {
    openedRoomIds,
    autoOpenLiveRoom,
    navigateOpenLiveRoom
  };
};

export const openLiveRoomManager = openLiveRoomManagerStore();