import { h } from "vue";
import { CopyBtn } from "../icon";
import type { TAnchorLot, TLotteryInfo, TRedPocket } from "@/types";
import { areaList, giftList, JoinRequirementMap, redPocketType } from "@/stores/lottery/data";
import { EReceiveType, ERedPocketType } from "@/stores/lottery/enums";
import { getAnchorJoinCondition, getRedPocketStyle } from "./roomList";
import { copyLottery, formatJoinTotal, getRedPocketTotal, useLotteryStore, useSettingsStore, openLiveRoomManager } from "@/stores";

export const roomListBox = () => {
  const { displayLotteryArray } = useLotteryStore();
  return h("ul", { class: `room-list ${getLotteryMinHeight()}` }, displayLotteryArray.value.map(item => roomItem(item)));
};

const roomItem = (item: TLotteryInfo) => {
  const { openedRoomIds } = openLiveRoomManager;
  return h("li", {
    class: {
      key: item.room_id,
      "room-item": true,
      "room-item-opened": openedRoomIds.value.has(item.room_id),
    }
  },
    [
      roomHeader(item),
      anchorLot(item.anchorLot),
      redPocket(item.uid, item.redPocketList)
    ]);
};

const roomHeader = (item: TLotteryInfo) => {
  const { navigateOpenLiveRoom } = openLiveRoomManager;

  return h("div", { class: "anchor" }, [
    h("div", { class: "anchor-area" }, areaList.get(item.area_id)),
    h("a", {
      class: "anchor-name text-ellipsis",
      onClick: () => navigateOpenLiveRoom(item.room_id, item.redPocketList, item.anchorLot)
    }, item.name),
    CopyBtn(() => copyLottery(item))
  ]);
};

const anchorLot = (_anchorLot?: TAnchorLot) => {
  const { lotteryFilterOptions } = useSettingsStore();
  if (!lotteryFilterOptions.show.anchorLot || !_anchorLot) return null;

  const anchorLotPic = (giftList[_anchorLot.award_name]?.price || 0) / 100 * _anchorLot.award_per_capita;

  return h("div", { class: "anchor-lot lottery" }, [
    h("div", { class: "lottery-row lottery-row2 vertically-center" }, [
      h("span", { class: "lottery-title" }, "天选"),
      h("span", { class: "lottery-title lottery-award text-ellipsis" }, _anchorLot.award_name),
      h("span", { class: "lottery-right" }, anchorLotPic > 0 ? `共${anchorLotPic}电池` : "")
    ]),
    h("div", { class: "lottery-row lottery-min text-ellipsis" }, [
      h("span", `${_anchorLot.award_num}人${anchorLotPic > 0 ? " x " + _anchorLot.award_per_capita + "份 " : " x 1份 "}`),
      ...getAnchorJoinCondition(_anchorLot),
    ]),
    h("div", { class: "lottery-row vertically-center" }, [
      h("span", { class: "lottery-min text-ellipsis" }, `${formatJoinTotal(_anchorLot.join_total)}人参与`),
      h("span", { class: "lottery-right" }, `${_anchorLot.showTime}[${_anchorLot.showEndTime}]`)
    ])
  ]);
};

const redPocket = (uid: number, redPocketList?: TRedPocket[]) => {
  const { lotteryFilterOptions } = useSettingsStore();
  if (!lotteryFilterOptions.show.redPocket || !redPocketList) return null;

  const list = redPocketList.map(item => {
    return h("li", { class: `lottery red-pocket-large ${getRedPocketStyle(item.total_price)} ${item.senderUid === uid ? "red-pocket-anchor" : ""}` }, [
      h("div", { class: "lottery-row lottery-row2 vertically-center" }, [
        h("span", { class: "lottery-title" }, redPocketType[item.rp_type]),
        h("span", { class: "lottery-title" }, `${item.total_price ? `${item.total_price / 100}电池` : "1~100"} / ${getRedPocketTotal(item)}份`),
        h("span", { class: "lottery-right lottery-min text-ellipsis" }, joinRequirementText(item))
      ]),
      h("div", { class: "lottery-row lottery-row2 vertically-center" }, [
        h("span", { class: "text-ellipsis lottery-min" }, item.sender_name),
        h("span", { class: "lottery-right" }, `${item.showTime}[${item.showEndTime}]`)
      ])
    ]);
  });
  return h("ul", { class: "red-pocket-list" }, list);
};

const joinRequirementText = (rp: TRedPocket) => {
  let result = JoinRequirementMap[rp.join_requirement];

  if (rp.receive_type === EReceiveType.SHARE_LIVE) {
    if (result) result += " & ";
    result += "分享";
  }

  return result;
};

const redPocketTypeVNode: Record<ERedPocketType, ReturnType<typeof h>> = {
  [ERedPocketType.NULL]: h("img", { src: "https://i1.hdslb.com/bfs/static/blive/blfe-live-room/static/img/battery-red-packet.0a7930e..svg" }),
  [ERedPocketType.GIFT]: h("img", { src: "https://i1.hdslb.com/bfs/static/blive/blfe-live-room/static/img/battery-red-packet.0a7930e..svg" }),
  [ERedPocketType.CAPTAIN]: h("img", { src: "https://i0.hdslb.com/bfs/live/ec669df60a1c4068676f5e31da6ed08993f9436d.png" }),
  [ERedPocketType.BATTERY]: h("img", { src: "https://i1.hdslb.com/bfs/static/blive/blfe-live-room/static/img/battery-value.08f243b..svg" }),
  [ERedPocketType.INTIMACY]: h("img", { src: "https://i1.hdslb.com/bfs/static/blive/blfe-live-room/static/img/intimacy.ab56e9e..png" }),
  [ERedPocketType.BATTERY2]: h("img", { src: "https://i1.hdslb.com/bfs/static/blive/blfe-live-room/static/img/battery-value.08f243b..svg" }),
};

const getLotteryMinHeight = () => {
  const { lotteryFilterOptions } = useSettingsStore();

  const { anchorLot, redPocket } = lotteryFilterOptions.show;
  if (anchorLot && redPocket) return "lot-all";

  if (anchorLot) return "lot-a";
  if (redPocket) return "lot-r";

  return 223;
};