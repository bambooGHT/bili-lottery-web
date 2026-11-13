import { h } from "vue";
import { headerBox } from "./header";
import { roomListBox } from "./roomList/roomListBox";
import { refreshLotteryBtn } from "./refresh";

export const ViewBox = () => {
  return h("section", [
    headerBox(),
    roomListBox(),
    refreshLotteryBtn()
  ]);
};