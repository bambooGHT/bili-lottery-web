import type { TAnchorLot, TRedPocket } from "@/types";
import type { ILotteryFilter, ILotteryFromAnchor, ILotteryFromRedPocket } from "../settings/types";
import { ERedPocketType } from "./enums";
import { EAtteryValueFilterOperator } from "../settings/enums";
import { giftList } from "./data";

export const getRedPocketTotal = (item: TRedPocket): number => {
  const { awards, win_num } = item;
  if (awards?.length) return awards.reduce((acc, cur) => acc + cur.num, 0);
  return win_num;
};

export const anchorLotFilter = (lotteryFilterType: ILotteryFromAnchor, anchorLotValue: number, anchorLot?: TAnchorLot): boolean => {
  if (!anchorLot) return false;

  const anchorLotPrice = anchorLot.award_per_capita ? (giftList[anchorLot.award_name || ""]?.price || 0) / 100 : 0;
  const pricePass = !anchorLotValue || anchorLotPrice >= anchorLotValue;
  return (
    (lotteryFilterType.anchorLot &&
      !!anchorLot.award_name &&
      !!anchorLot.award_price_text && pricePass) ||
    (lotteryFilterType.zeroValueAnchorLot &&
      !!anchorLot.award_name &&
      !anchorLot.award_per_capita)
  );
};

export const redPocketFilter = (lotteryFilter: ILotteryFilter, uid: number, rpList?: TRedPocket[]) => {
  if (!rpList?.length) return [];

  const { batteryValue, batteryValueFilterOperator } = lotteryFilter;
  const { gteValue, lteValue, average } = batteryValue;

  const gteV = gteValue || -Infinity;
  const lteV = lteValue || Infinity;

  return rpList.filter(rp => {
    if (!redPocketTypeFilter[rp.rp_type](lotteryFilter.type, rp, uid)) return false;
    if (!gteValue && !lteValue && !average) return true;

    const price = rp.total_price / 100;
    const total = getRedPocketTotal(rp);

    const valueMatch = price >= gteV && price <= lteV;
    const averageMatch = total > 0 && price / total >= average;

    if (!gteValue && !lteValue) return averageMatch;
    if (!average) return valueMatch;

    return batteryValueFilterOperator === EAtteryValueFilterOperator.AND
      ? valueMatch && averageMatch
      : valueMatch || averageMatch;
  });
};

const redPocketTypeFilter: Record<ERedPocketType, (lotteryFilterType: ILotteryFromRedPocket, rp: TRedPocket, uid: number) => boolean> = {
  [ERedPocketType.NULL]: (lotteryFilterType, rp) => {
    if (!!rp.receive_uname) return lotteryFilterType.roomExclusiveRedPocket;
    return lotteryFilterType.giftRedPocket;
  },
  [ERedPocketType.GIFT]: (lotteryFilterType, rp) => {
    if (!!rp.receive_uname) return lotteryFilterType.roomExclusiveRedPocket;
    return lotteryFilterType.giftRedPocket;
  },
  [ERedPocketType.CAPTAIN]: (lotteryFilterType) => {
    return lotteryFilterType.captainRedPocket;
  },
  [ERedPocketType.BATTERY]: (lotteryFilterType) => {
    return lotteryFilterType.batteryRedPocket;
  },
  [ERedPocketType.INTIMACY]: (lotteryFilterType) => {
    return lotteryFilterType.intimacyRedPocket;
  },
  [ERedPocketType.BATTERY2]: (lotteryFilterType, rp, uid) => {
    return lotteryFilterType.redPocketFromAnchor && rp.senderUid === uid;
  },
};