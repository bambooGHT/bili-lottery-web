import { reactive, toRaw, watch } from "vue";
import type { ILotteryFilterOptions, ISettings, ILotteryFilter } from "./types";
import { ESort, ESortType, EAtteryValueFilterOperator } from "./enums";

const SETTINGS_KEY = 'settings';
const FILTER_KEY = 'lottery_filter_options';

const mergeDefaults = <T>(defaults: T, value: unknown): T => {
  if (Array.isArray(defaults)) {
    if (!Array.isArray(value)) return defaults;
    return value.filter(item => item !== undefined).map((item, index) => index < defaults.length ? mergeDefaults(defaults[index], item) : item) as T;
  }

  if (defaults !== null && typeof defaults === "object" && Object.getPrototypeOf(defaults) === Object.prototype) {
    if (value === null || typeof value !== "object" || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) return defaults;
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(defaults)) {
      const defaultValue = (defaults as Record<string, unknown>)[key];
      const hasValue = Object.prototype.hasOwnProperty.call(value, key);
      result[key] = hasValue ? mergeDefaults(defaultValue, (value as Record<string, unknown>)[key]) : defaultValue;
    }
    return result as T;
  }

  if (value === undefined) return value as T;
  if (value === null || typeof value !== typeof defaults) return defaults;
  return value as T;
};

const createLotteryFilter = (): ILotteryFilter => {
  return {
    name: "filter",
    enable: false,
    systemNotificationLottery: false,
    autoOpenLiveRoom: false,
    batteryValueFilterOperator: EAtteryValueFilterOperator.AND,
    batteryValue: {
      gteValue: 0,
      lteValue: 0,
      average: 0,
      anchorLotValue: 0
    },
    type: {
      anchorLot: true,
      zeroValueAnchorLot: true,
      batteryRedPocket: true,
      giftRedPocket: true,
      roomExclusiveRedPocket: true,
      captainRedPocket: true,
      redPocketFromAnchor: true,
      intimacyRedPocket: true,
    }
  };
};

const loadStorage = <T>(key: string, defaults: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaults;

    const result = JSON.parse(raw);

    return mergeDefaults(defaults, result);
  } catch {
    return defaults;
  }
};

const saveStorage = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const settingsStore = () => {
  const settings = reactive<ISettings>(loadStorage(SETTINGS_KEY, {
    verify: {
      user: "",
      key: ""
    },
    autoRefreshInterval: 20,
    sortType: ESortType.TIME,
    sort: ESort.ASC,
    copyId: false
  }));

  const lotteryFilterOptions = reactive<ILotteryFilterOptions>(loadStorage(FILTER_KEY, {
    show: {
      anchorLot: true,
      redPocket: true
    },
    lotteryFilterList: [createLotteryFilter()]
  }));

  const addLotteryFilter = () => {
    if (lotteryFilterOptions.lotteryFilterList.length >= 5) return;
    lotteryFilterOptions.lotteryFilterList.push(createLotteryFilter());
  };

  const removeLotteryFilter = (index: number) => {
    if (lotteryFilterOptions.lotteryFilterList.length <= 1) return;
    lotteryFilterOptions.lotteryFilterList.splice(index, 1);
  };

  watch(settings, () => saveStorage(SETTINGS_KEY, toRaw(settings)),
    { deep: true, immediate: true });

  watch(lotteryFilterOptions, () => saveStorage(FILTER_KEY, toRaw(lotteryFilterOptions)),
    { deep: true, immediate: true });

  return {
    settings,
    lotteryFilterOptions,
    addLotteryFilter,
    removeLotteryFilter
  };
};

const instance = settingsStore();
export const useSettingsStore = () => instance;