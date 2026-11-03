import { requireGuardValue } from "@/stores/lottery/data";
import { EJoinRequirementOptions } from "@/stores/lottery/enums";
import type { TAnchorLot } from "@/types";
import { h } from "vue";


export const getRedPocketStyle = (price: number) => {
  const s = RedPocketStyle.find(t => price <= t.value)!;
  return s.style;
};

export const getAnchorJoinCondition = (at: TAnchorLot) => {
  const text = AnchorLotCondition[at.require_type](at);
  const gift = at.gift_name ? [
    h("span", `\u00A0|\u00A0`),
    h("span", { style: "color: #e05224" }, `${at.gift_name}x${at.gift_num} (${at.gift_price / 100 * at.gift_num}电池)`)
  ] : [];
  return [
    h("span", text),
    ...gift
  ];
};

const AnchorLotCondition: Record<EJoinRequirementOptions, (at: TAnchorLot) => string> = {
  [EJoinRequirementOptions.ALL]: () => {
    return "";
  },
  [EJoinRequirementOptions.FOLLOW]: () => {
    return "\u00A0| 关注";
  },
  [EJoinRequirementOptions.FANCLUB]: (at) => {
    return `\u00A0| 粉丝牌[${at.require_value}级]`;
  },
  [EJoinRequirementOptions.GUARD]: (at) => {
    return `\u00A0| 大航海[${requireGuardValue[at.require_value]}]`;
  }
};

export const RedPocketStyle = [
  {
    value: 0,
    style: "red-pocket-intimacy"
  },
  {
    value: 9999,
    style: "red-pocket-small"
  },
  {
    value: 20000,
    style: "red-pocket-medium-2"
  },
  {
    value: 52000,
    style: "red-pocket-medium"
  },
  {
    value: 100000000,
    style: "red-pocket-large"
  },
];