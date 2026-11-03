import type { EJoinRequirementOptions, EReceiveType, ERedPocketType } from "./stores/lottery/enums";

export type TLotteryInfo = {
  /** id */
  readonly uid: number;
  /** 用户名 */
  readonly name: string;
  /** 房间号 */
  readonly room_id: number;
  readonly area_id: number;
  /** 天选 */
  anchorLot?: TAnchorLot;
  /** 红包 */
  redPocketList?: TRedPocket[];
};

export type TAnchorLot = {
  id: number;
  award_name: string;
  award_num: number;
  /** 结束时间(**秒**) */
  end_time: number;
  require_type: EJoinRequirementOptions;
  require_value: number;
  require_text: string;
  award_price_text: string;
  gift_name: string;
  gift_num: number;
  gift_price: number;
  award_per_capita: number;
  join_total: number;
  showTime: string | "已结束";
  showEndTime: string;
};

export type TRedPocket = {
  lot_id: number;
  /** 参与条件 */
  join_requirement: EJoinRequirementOptions;
  /** 红包发送者 */
  sender_name: string;
  /** 总价/100 */
  total_price: number;
  /** 红包类型 */
  rp_type: ERedPocketType;
  /** 结束时间(**秒**) */
  end_time: number;
  /** 亲密度红包数量 */
  win_num: number;
  /** 亲密度描述 */
  intimacy_desc: string;
  /** 是否需要分享直播间 */
  receive_type: EReceiveType;
  /** 红包内容 */
  awards?: Array<{
    num: number;
    gift_name: string;
  }>;
  senderUid: number;
  receive_uname: string;
  showTime: string | "已结束";
  showEndTime: string;
};