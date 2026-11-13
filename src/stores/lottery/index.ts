import type { TLotteryInfo } from "@/types";
import { computed, ref } from "vue";
import { anchorLotFilter, getRedPocketTotal, redPocketFilter } from "./filter";
import { useSettingsStore } from "../settings";
import { ESort, ESortType } from "../settings/enums";
import { giftList } from "./data";
import { formatRemain, formatJoinTotal } from "./format";
import { Ticker } from "@/utils/ticker";
import { throttle } from "@/utils/throttle";
import { notify } from "../notify";
import { globalTicker } from "../ticker";
import { openLiveRoomManager } from "../openLiveRoom";
export * from "./copyLottery";

const lotteryStore = () => {
  const lotteryMap = new Map<number, TLotteryInfo>();
  const displayLotteryMap = ref(new Map<number, TLotteryInfo>());
  const settings = useSettingsStore();

  let autoRefreshTicker: Ticker | null = null;
  let unAutoRefreshTicker: (() => void) | undefined;

  const hasRedPocketType = computed(() => {
    const enabledFilters = settings.lotteryFilterOptions.lotteryFilterList.filter(filter => filter.enable);
    if (!enabledFilters.length) return true;

    return enabledFilters.some(filter => Object.entries(filter.type).some(([key, value]) =>
      key !== "anchorLot" && key !== "zeroValueAnchorLot" && value));
  });

  const useRedPocketSort = computed(() => {
    return settings.lotteryFilterOptions.show.redPocket && hasRedPocketType.value;
  });

  const getSortValue = computed<(item: TLotteryInfo) => number>(() => {
    const { sortType } = settings.settings;

    if (sortType === ESortType.TIME) {
      return useRedPocketSort.value
        ? item => Math.min(...(item.redPocketList || []).map(p => p.end_time), Infinity)
        : item => (item.anchorLot?.end_time ?? Infinity);
    }

    return useRedPocketSort.value
      ? item => Math.max(...(item.redPocketList || []).map(p => p.total_price), 0)
      : item => (giftList[item.anchorLot?.award_name ?? ""]?.price ?? 0) * (item.anchorLot?.award_per_capita ?? 0);
  });

  const displayLotteryArray = computed(() => {
    if (!displayLotteryMap.value.size) return [];

    const list = [...displayLotteryMap.value.values()];
    const getSortValueFn = getSortValue.value;
    const direction = settings.settings.sort === ESort.ASC ? 1 : -1;

    return list.sort((a, b) => {
      if (useRedPocketSort.value) {
        const diff = Number(!!b.redPocketList?.length) - Number(!!a.redPocketList?.length);

        if (diff) return diff;
      }

      return (getSortValueFn(a) - getSortValueFn(b)) * direction;
    });
  });

  const updateShowTime = (now: number, lottery: TLotteryInfo) => {
    const { anchorLot, redPocketList } = lottery;
    if (anchorLot && anchorLot.showTime !== "已结束") {
      anchorLot.showTime = formatRemain(now, anchorLot.end_time);
    }

    redPocketList?.forEach(p => {
      if (p.showTime !== "已结束") p.showTime = formatRemain(now, p.end_time);
    });
  };

  const updateShowEndTime = (lottery: TLotteryInfo) => {
    const { anchorLot, redPocketList } = lottery;

    if (anchorLot) anchorLot.showEndTime = new Date(anchorLot.end_time * 1000).toLocaleTimeString();
    redPocketList?.forEach(p => {
      p.showEndTime = new Date(p.end_time * 1000).toLocaleTimeString();
    });
  };

  const updateLottery = (item: TLotteryInfo, now: number) => {
    updateShowTime(now, item);
    updateShowEndTime(item);
    lotteryMap.set(item.room_id, item);
  };

  const setLotteryList = (list: TLotteryInfo[]) => {
    lotteryMap.clear();
    displayLotteryMap.value.clear();

    const now = Date.now() / 1000;
    list.forEach(item => updateLottery(item, now));

    processLottery([...lotteryMap.values()]);
  };

  const addLottery = (item: TLotteryInfo) => {
    updateLottery(item, Date.now() / 1000);
    processLottery(item);
  };

  const filterLotteryAll = () => {
    displayLotteryMap.value.clear();
    processLottery([...lotteryMap.values()]);
  };

  const processLottery = (items: TLotteryInfo | TLotteryInfo[]) => {
    const { show, lotteryFilterList } = settings.lotteryFilterOptions;
    const isSingleItem = !Array.isArray(items);
    const list = Array.isArray(items) ? items : [items];

    list.forEach(lot => {
      let added = false;
      let notifyed = false;

      lotteryFilterList.forEach(options => {
        const { batteryValue: { average, gteValue, lteValue, anchorLotValue }, type } = options;
        const redPocketList = redPocketFilter(options, lot.uid, lot.redPocketList);
        const anchorPass = anchorLotFilter(type, anchorLotValue, lot.anchorLot);
        const redPocketPass = !!redPocketList.length;
        const hvR = !!(average || gteValue || lteValue);
        const hvA = !!anchorLotValue;

        const mR = hvR && redPocketPass;
        const mA = hvA && anchorPass;

        if (options.enable && !added) {
          if ((show.redPocket && mR) || (show.anchorLot && mA)) {
            displayLotteryMap.value.set(lot.room_id, lot);
            added = true;
          }

          if ((!hvR && show.redPocket && redPocketPass) || (!hvA && show.anchorLot && anchorPass)) {
            displayLotteryMap.value.set(lot.room_id, lot);
            added = true;
          }
        }

        if (!isSingleItem) return;
        if (options.systemNotificationLottery && !notifyed) {
          let type = "";
          if (show.redPocket && mR) type = "redPocket";
          else if (mA) type = "anchorLot";

          if (type) {
            notify.sendNotify({ ...lot as Required<TLotteryInfo>, redPocketList }, type);
            notifyed = true;
          }
        }

        if (options.autoOpenLiveRoom && (mR || mA)) {
          const vR = mR ? redPocketList : undefined;
          const vA = mA ? lot.anchorLot : undefined;
          openLiveRoomManager.autoOpenLiveRoom(lot.room_id, vR, vA);
        }
      });
    });
  };

  const updateAllShowTime = (now: number) => {
    const t = now / 1000;

    displayLotteryMap.value.forEach(item => {
      updateShowTime(t, item);
    });
  };

  const refreshLotteryList = throttle(() => {
    const now = Date.now() / 1000;

    for (const [roomId, item] of lotteryMap) {
      if (item.anchorLot && item.anchorLot.end_time <= now) {
        item.anchorLot = undefined;
      }

      if (item.redPocketList?.length) {
        item.redPocketList = item.redPocketList.filter(p => p.end_time > now);
      }

      if (!item.anchorLot && !item.redPocketList?.length) {
        lotteryMap.delete(roomId);
      }
    }

    filterLotteryAll();
  }, 1500);

  const updateAutoRefreshTicker = () => {
    unAutoRefreshTicker?.();
    unAutoRefreshTicker = undefined;
    autoRefreshTicker = null;

    if (!settings.settings.autoRefreshInterval) return;

    autoRefreshTicker = new Ticker(settings.settings.autoRefreshInterval * 1000);
    unAutoRefreshTicker = autoRefreshTicker.subscribe(refreshLotteryList);
  };

  globalTicker.subscribe(updateAllShowTime);
  updateAutoRefreshTicker();

  return {
    displayLotteryArray,
    setLotteryList,
    addLottery,
    filterLotteryAll,
    refreshLotteryList,
    updateAutoRefreshTicker,
  };
};

const instance = lotteryStore();
const useLotteryStore = () => instance;

export { getRedPocketTotal, useLotteryStore, formatJoinTotal };