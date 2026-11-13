import type { TLotteryInfo } from "@/types";
import { anchorLotFilter, redPocketFilter } from "./filter";
import type { ILotteryFilter } from "../settings/types";
import { computed, ref } from "vue";
import { useSettingsStore } from "../settings";
import { notify } from "../notify";
import { openLiveRoomManager } from "../openLiveRoom";
import { ESort, ESortPartScope, ESortType } from "../settings/enums";
import { giftList } from "./data";

const isIterable = (value: unknown): value is Iterable<unknown> => {
  return value != null && typeof (value as { [Symbol.iterator]?: unknown; })[Symbol.iterator] === 'function';
};

export const lotteryList = () => {
  const lotteryMap = new Map<number, TLotteryInfo>();
  const lotteryDisplayMap = ref(new Map<number, TLotteryInfo>());

  const settings = useSettingsStore();

  const displayLotteryList = computed(() => {
    const direction = settings.settings.sort === ESort.ASC ? 1 : -1;
    const getValue = getSortValue.value;

    return [...lotteryDisplayMap.value.values()].map(item => ({
      item,
      values: getValue(item)
    })).sort((a, b) => {
      const diff = (a.values[0] - b.values[0]) * direction;
      return diff || (a.values[1] - b.values[1]) * direction;
    }).map(({ item }) => item);
  });

  const getSortValue = computed(() => {
    const { sortType, sortPartScope } = settings.settings;
    const isTime = sortType === ESortType.TIME;

    const getAnchorValue = isTime
      ? (item: TLotteryInfo) => item.anchorLot?.end_time ?? Infinity
      : (item: TLotteryInfo) =>
        (giftList[item.anchorLot?.award_name ?? ""]?.price ?? 0) *
        (item.anchorLot?.award_per_capita ?? 0);

    const getRedPocketValue = isTime
      ? (item: TLotteryInfo) =>
        Math.min(...(item.redPocketList ?? []).map(p => p.end_time), Infinity)
      : (item: TLotteryInfo) =>
        Math.max(...(item.redPocketList ?? []).map(p => p.total_price), 0);

    return sortPartScope === ESortPartScope.RED_POCKET
      ? (item: TLotteryInfo) => [getRedPocketValue(item), getAnchorValue(item)]
      : (item: TLotteryInfo) => [getAnchorValue(item), getRedPocketValue(item)];
  });

  const setLotteryList = (list: Iterable<TLotteryInfo>) => {
    lotteryClear();
    for (const item of list) {
      lotteryMap.set(item.room_id, item);
    }

    processLottery(list);
  };

  const addLottery = (item: TLotteryInfo) => {
    lotteryMap.set(item.room_id, item);
    processLottery(item);
  };

  const refreshLotteryDisplay = () => {
    lotteryDisplayMap.value.clear();
    processLottery(lotteryMap.values());
  };

  const lotteryClear = () => {
    lotteryMap.clear();
    lotteryDisplayMap.value.clear();
  };

  const processLottery = (items: TLotteryInfo | Iterable<TLotteryInfo>) => {
    const isSingleItem = !isIterable(items);
    const list = isSingleItem ? [items as TLotteryInfo] : items as Iterable<TLotteryInfo>;
    const { lotteryFilterList } = settings.lotteryFilterOptions;

    for (const lot of list) {
      let added = false;
      let notifyed = false;

      for (const lotteryFilter of lotteryFilterList) {
        const result = matchLottery(lot, lotteryFilter);

        added ||= addLotteryDisplay(lot, result);
        if (!isSingleItem) {
          if (added) return;
          continue;
        }
        if (!notifyed && lotteryFilter.systemNotificationLottery) notifyed = sendLotteryNotification(lot, result);
        if (lotteryFilter.autoOpenLiveRoom) autoOpenLotteryRoom(lot, result);
      }
    }
  };

  const matchLottery = (item: TLotteryInfo, lotteryFilter: ILotteryFilter) => {
    const { uid, redPocketList, anchorLot } = item;
    const { batteryValue: { average, gteValue, lteValue, anchorLotValue }, type } = lotteryFilter;
    const redPocketListFiltered = redPocketFilter(lotteryFilter, uid, redPocketList);
    const anchorPass = anchorLotFilter(type, anchorLotValue, anchorLot);
    const redPocketPass = !!redPocketListFiltered.length;
    const hvR = !!(average || gteValue || lteValue);
    const hvA = !!anchorLotValue;

    const mR = hvR && redPocketPass;
    const mA = hvA && anchorPass;


    return {
      redPocketList,
      anchorPass,
      redPocketPass,
      hvR,
      hvA,
      mR,
      mA
    };
  };

  const addLotteryDisplay = (lot: TLotteryInfo, result: ReturnType<typeof matchLottery>) => {
    const { show } = settings.lotteryFilterOptions;
    const { anchorPass, redPocketPass, hvR, hvA, mR, mA, } = result;

    if (
      (show.redPocket && mR)
      || (show.anchorLot && mA)
      || (!hvR && show.redPocket && redPocketPass)
      || (!hvA && show.anchorLot && anchorPass)
    ) {
      lotteryDisplayMap.value.set(lot.room_id, lot);
      return true;
    }

    return false;
  };

  const sendLotteryNotification = (lot: TLotteryInfo, result: ReturnType<typeof matchLottery>) => {
    const { redPocketList, mR, mA } = result;
    let type = "";
    if (mR) type = "redPocket";
    else if (mA) type = "anchorLot";

    if (type) {
      notify.sendNotify({ ...lot as Required<TLotteryInfo>, redPocketList }, type);
      return true;
    }

    return false;
  };

  const autoOpenLotteryRoom = (lot: TLotteryInfo, result: ReturnType<typeof matchLottery>) => {
    const { mR, mA } = result;

    if (mR || mA) {
      openLiveRoomManager.autoOpenLiveRoom(lot.room_id);
    }
  };

  return {
    displayLotteryList,
    setLotteryList,
    addLottery,
    refreshLotteryDisplay,
  };
};