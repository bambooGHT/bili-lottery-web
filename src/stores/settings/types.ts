import type { ESortType, ESort, EAtteryValueFilterOperator, ESortPartScope } from "./enums";

export interface ISettings {
  verify: {
    user: string;
    key: string;
  };
  autoRefreshInterval: number;
  sortType: ESortType;
  sort: ESort;
  copyId: boolean;
  sortPartScope: ESortPartScope;
}

export interface ILotteryFromAnchor {
  anchorLot: boolean;
  zeroValueAnchorLot: boolean;
}

export interface ILotteryFromRedPocket {
  batteryRedPocket: boolean;
  giftRedPocket: boolean;
  roomExclusiveRedPocket: boolean;
  captainRedPocket: boolean;
  redPocketFromAnchor: boolean;
  intimacyRedPocket: boolean;
};

export interface ILotteryFilter {
  enable: boolean,
  name: string;
  batteryValueFilterOperator: EAtteryValueFilterOperator;
  systemNotificationLottery: boolean;
  autoOpenLiveRoom: boolean;
  batteryValue: {
    gteValue: number;
    lteValue: number;
    average: number;
    anchorLotValue: number;
  };
  type: ILotteryFromAnchor & ILotteryFromRedPocket;
}
export interface ILotteryFilterOptions {
  lotteryFilterList: Array<ILotteryFilter>;
  show: {
    anchorLot: boolean;
    redPocket: boolean;
  };
}