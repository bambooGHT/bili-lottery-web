import { giftList, JoinRequirementMap, redPocketType } from "@/stores/lottery/data";
import type { TAnchorLot, TLotteryInfo, TRedPocket } from "@/types";
import { formatRemain } from "@/stores/lottery/format";
import { getRedPocketTotal } from "@/stores";
import { EJoinRequirementOptions, EReceiveType } from "@/stores/lottery/enums";

export const copyLottery = async (lot: TLotteryInfo) => {
  if (!navigator.clipboard || !window.isSecureContext) return;

  const { anchorLot, redPocketList, name, room_id, uid } = lot;
  const now = Date.now() / 1000;

  const anchorLotText = formatAnchorLotText(now, anchorLot);

  const redPocketListTextList = formatRedPocketListTextList(now, uid, redPocketList);

  const texts = [
    anchorLotText,
    (redPocketList && anchorLotText) && "\r",
    redPocketListTextList.join("\n\n"),
    (redPocketList || anchorLotText) && "\r",
    `${name}  ${room_id}`,
    `https://live.bilibili.com/${room_id}`
  ].filter(Boolean);

  await navigator.clipboard.writeText(texts.join("\n"));
};

export const formatAnchorLotText = (now: number, anchorLot?: TAnchorLot) => {
  if (!anchorLot) return "";
  const anchorLotPrice = anchorLot.award_per_capita ? (giftList[anchorLot.award_name || ""]?.price || 0) / 100 : 0;
  const anchorLotText = (anchorLotPrice ? `[天选] ${anchorLot.award_name} ${anchorLotPrice}电池` : `[无价值天选] ${anchorLot.award_name}`)
    + `(${anchorLot.award_num}人${anchorLotPrice ? " * " + anchorLot.award_per_capita + "份)" : ")"}`
    + `(${anchorLot.require_text})`
    + `\n剩余${formatRemain(now, anchorLot.end_time)}(${new Date(anchorLot.end_time * 1000).toLocaleTimeString()})`;

  return anchorLotText;
};

export const formatRedPocketListTextList = (now: number, uid: number, redPocketList?: TRedPocket[]) => {
  if (!redPocketList) return [];
  return redPocketList.map(r => {
    const rpType = redPocketType[r.rp_type];
    return `[${rpType}] ${r.total_price / 100}电池 / ${getRedPocketTotal(r)}份`
      + conditionalText(r.join_requirement, r.receive_type)
      + `${r.senderUid === uid ? "\n主播自发红包" : ""}`
      + `\n剩余: ${formatRemain(now, r.end_time)}(${new Date(r.end_time * 1000).toLocaleTimeString()})`;
  });
};

const conditionalText = (join_requirement: EJoinRequirementOptions, receive_type: EReceiveType) => {
  let text = "";
  const joinReq = JoinRequirementMap[join_requirement];

  if (joinReq) text += `\n条件: ${joinReq}`;
  if (receive_type === EReceiveType.SHARE_LIVE) {
    text += `${joinReq ? " && " : "\n条件: "}分享直播间`;
  }

  return text;
};
