import type { TLotteryInfo } from "@/types";
import { globalTicker } from "../ticker";

export const getMaxEndTime = (lot: TLotteryInfo) => {
  return Math.max(
    lot.anchorLot?.end_time ?? 0,
    ...(lot.redPocketList?.map(item => item.end_time) ?? [])
  );
};

export const useLotteryIdDeduplication = () => {
  const roomCache = new Map<number, {
    anchorLotId?: number;
    redPocketIdList: number[];
    maxEndTime: number;
  }>();

  const addLotteryData = (lot: TLotteryInfo) => {
    const { room_id, anchorLot, redPocketList } = lot;

    const newData = {
      anchorLotId: anchorLot?.id,
      redPocketIdList: (redPocketList ?? []).map(p => p.lot_id),
      maxEndTime: getMaxEndTime(lot)
    };

    const cachedData = roomCache.get(room_id);

    if (cachedData) {
      const anchorLotChanged = newData.anchorLotId && newData.anchorLotId !== cachedData.anchorLotId;
      const hasNewRedPocket = newData.redPocketIdList.some(id => !cachedData.redPocketIdList.includes(id));

      if (!anchorLotChanged && !hasNewRedPocket) return false;
    }

    roomCache.set(room_id, newData);

    return true;
  };

  const deleteRoomCache = (now: number) => {
    now /= 1000;
    for (const [roomId, item] of roomCache) {
      if (now >= item.maxEndTime) {
        roomCache.delete(roomId);
      }
    }
  };

  globalTicker.subscribe(deleteRoomCache);

  return { addLotteryData };
};