import type { TLotteryInfo } from "@/types";
import { anchorLotFilter, redPocketFilter } from "./filter";
import type { ILotteryFilter } from "../settings/types";
import { computed, ref } from "vue";
import { useSettingsStore } from "../settings";
import { notify } from "../notify";
import { openLiveRoomManager } from "../openLiveRoom";
import { ESort, ESortPriority, ESortType } from "../settings/enums";
import { giftList } from "./data";
import { formatRemain } from "./format";
import { getMaxEndTime, lotteryIdDeduplication } from "../lotteryIdDeduplication";

const isIterable = (value: unknown): value is Iterable<unknown> => {
  return value != null && typeof (value as { [Symbol.iterator]?: unknown; })[Symbol.iterator] === 'function';
};

export const useLotteryData = () => {
  const lotteryMap = ref(new Map<number, TLotteryInfo>());
  const lotteryDisplayMap = ref(new Map<number, TLotteryInfo>());

  const settings = useSettingsStore();

  const displayLotteryList = computed(() => {
    const { sort, sortPriority } = settings.settings;
    const direction = sort === ESort.ASC ? 1 : -1;
    const list = [...lotteryDisplayMap.value.values()];

    const getValue = getSortValue.value;
    const compare = (a: TLotteryInfo, b: TLotteryInfo) => {
      const [a1, a2 = 0] = getValue(a);
      const [b1, b2 = 0] = getValue(b);

      return (a1 - b1 || a2 - b2) * direction;
    };

    if (sortPriority === ESortPriority.ALL) return list.sort(compare);

    const isAnchor = sortPriority === ESortPriority.ANCHOR_LOT;
    const priorityList: TLotteryInfo[] = [];
    const otherList: TLotteryInfo[] = [];

    for (const item of list) {
      const hasPriority = isAnchor
        ? !!item.anchorLot
        : !!item.redPocketList?.length;

      (hasPriority ? priorityList : otherList).push(item);
    }

    return [
      ...priorityList.sort(compare),
      ...otherList.sort(compare)
    ];
  });
  const getSortValue = computed(() => {
    const { sortType, sortPriority } = settings.settings;
    const isTime = sortType === ESortType.TIME;

    const getAnchorValue = isTime
      ? (item: TLotteryInfo) => item.anchorLot?.end_time ?? Infinity
      : (item: TLotteryInfo) =>
        (giftList[item.anchorLot?.award_name ?? ""]?.price ?? 0) *
        (item.anchorLot?.award_per_capita ?? 0);

    const getRedPocketValue = isTime
      ? (item: TLotteryInfo) => item.redPocketList?.reduce((min, p) => Math.min(min, p.end_time), Infinity) ?? Infinity
      : (item: TLotteryInfo) => item.redPocketList?.reduce((max, p) => Math.max(max, p.total_price), 0) ?? 0;

    if (sortPriority === ESortPriority.ALL) {
      return (item: TLotteryInfo) => [isTime
        ? Math.min(getAnchorValue(item), getRedPocketValue(item))
        : Math.max(getAnchorValue(item), getRedPocketValue(item))
      ];
    }

    return sortPriority === ESortPriority.RED_POCKET
      ? (item: TLotteryInfo) => [getRedPocketValue(item), getAnchorValue(item)]
      : (item: TLotteryInfo) => [getAnchorValue(item), getRedPocketValue(item)];
  });

  const replaceLotteryList = (list: Iterable<TLotteryInfo>) => {
    lotteryClear();
    const now = Date.now() / 1000;
    for (const item of list) {
      updateLottery(item, now);
    }

    handleLotteryItems(list);
  };

  const addLottery = (item: TLotteryInfo) => {
    updateLottery(item, Date.now() / 1000);
    handleLotteryItems(item);
  };

  const updateLottery = (item: TLotteryInfo, now: number) => {
    updateShowTime(item, now);
    updateShowEndTime(item);
    lotteryMap.value.set(item.room_id, item);
  };

  const refreshLotteryDisplayList = () => {
    lotteryDisplayMap.value.clear();
    handleLotteryItems(lotteryMap.value.values());
  };

  const lotteryClear = () => {
    lotteryMap.value.clear();
    lotteryDisplayMap.value.clear();
  };

  const getLotterySize = () => {
    return lotteryMap.value.size;
  };

  const handleLotteryItems = (items: TLotteryInfo | Iterable<TLotteryInfo>) => {
    const isSingleItem = !isIterable(items);
    const list = isSingleItem ? [items as TLotteryInfo] : items as Iterable<TLotteryInfo>;
    const { lotteryFilterList } = settings.lotteryFilterOptions;

    for (const lot of list) {
      let added = false;
      let notified = false;

      const is = lotteryIdDeduplication.addLotteryData(lot);
      for (const lotteryFilter of lotteryFilterList) {
        const result = evaluateLotteryFilter(lot, lotteryFilter);

        if (!added && lotteryFilter.enable) added = addLotteryDisplay(lot, result);
        if (!isSingleItem) {
          if (added) break;
          continue;
        }
        if (!notified && lotteryFilter.systemNotificationLottery && is) notified = sendLotteryNotification(lot, result);
        if (lotteryFilter.autoOpenLiveRoom && is) autoOpenLotteryRoom(lot, result);
      }
    }
  };

  const evaluateLotteryFilter = (item: TLotteryInfo, lotteryFilter: ILotteryFilter) => {
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

  const addLotteryDisplay = (lot: TLotteryInfo, result: ReturnType<typeof evaluateLotteryFilter>) => {
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

  const sendLotteryNotification = (lot: TLotteryInfo, result: ReturnType<typeof evaluateLotteryFilter>) => {
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

  const autoOpenLotteryRoom = (lot: TLotteryInfo, result: ReturnType<typeof evaluateLotteryFilter>) => {
    const { mR, mA } = result;

    if (mR || mA) {
      openLiveRoomManager.openLiveRoom(lot.room_id, getMaxEndTime(lot));
    }
  };

  const updateShowTime = (lottery: TLotteryInfo, now: number) => {
    const { anchorLot, redPocketList } = lottery;
    if (anchorLot && anchorLot.showTime !== "已结束") {
      anchorLot.showTime = formatRemain(now, anchorLot.end_time);
    }

    redPocketList?.forEach(p => {
      if (p.showTime !== "已结束") p.showTime = formatRemain(now, p.end_time);
    });
  };

  const updateDisplayLotteryListShowTime = (now: number) => {
    const t = now / 1000;

    lotteryDisplayMap.value.forEach(item => {
      updateShowTime(item, t);
    });
  };

  const updateShowEndTime = (lottery: TLotteryInfo) => {
    const { anchorLot, redPocketList } = lottery;

    if (anchorLot) anchorLot.showEndTime = new Date(anchorLot.end_time * 1000).toLocaleTimeString();
    redPocketList?.forEach(p => {
      p.showEndTime = new Date(p.end_time * 1000).toLocaleTimeString();
    });
  };

  const refreshLotteryList = () => {
    const now = Date.now() / 1000;

    for (const [roomId, item] of lotteryMap.value) {
      if (item.anchorLot && item.anchorLot.end_time <= now) {
        item.anchorLot = undefined;
      }

      if (item.redPocketList?.length) {
        item.redPocketList = item.redPocketList.filter(p => p.end_time > now);
      }

      if (!item.anchorLot && !item.redPocketList?.length) {
        lotteryMap.value.delete(roomId);
      }
    }

    refreshLotteryDisplayList();
  };

  return {
    displayLotteryList,
    replaceLotteryList,
    addLottery,
    refreshLotteryList,
    refreshLotteryDisplayList,
    updateDisplayLotteryListShowTime,
    getLotterySize,
  };
};