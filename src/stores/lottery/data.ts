import type { TAnchorLot } from "@/types";
import { EJoinRequirementOptions, ERedPocketType } from "./enums";

export const redPocketType: Record<ERedPocketType, string> = {
  [ERedPocketType.NULL]: "礼物红包",
  [ERedPocketType.GIFT]: "礼物红包",
  [ERedPocketType.CAPTAIN]: "0.1折上舰",
  [ERedPocketType.BATTERY]: "电池红包",
  [ERedPocketType.INTIMACY]: "亲密度红包",
  [ERedPocketType.BATTERY2]: "电池红包",
};

export const joinRequirementMap = {
  [EJoinRequirementOptions.ALL]: "",
  [EJoinRequirementOptions.FOLLOW]: "关注",
  [EJoinRequirementOptions.FANCLUB]: "粉丝团",
  [EJoinRequirementOptions.GUARD]: "大航海"
};

export const anchorLotJoinCondition: Record<EJoinRequirementOptions, (at: TAnchorLot) => string> = {
  [EJoinRequirementOptions.ALL]: () => {
    return "";
  },
  [EJoinRequirementOptions.FOLLOW]: () => {
    return "关注";
  },
  [EJoinRequirementOptions.FANCLUB]: (at) => {
    return `粉丝牌[${at.require_value}级]`;
  },
  [EJoinRequirementOptions.GUARD]: (at) => {
    return `大航海[${requireGuardValue[at.require_value]}]`;
  }
};

export const giftList = Object.fromEntries([
  {
    "id": 34003,
    "name": "人气票",
    "img": "https://s1.hdslb.com/bfs/live/7d78646ee4ecc900cebbe46cb963f421079548f0.png",
    "price": 100
  },
  {
    "id": 34016,
    "name": "小花花",
    "img": "https://s1.hdslb.com/bfs/live/5126973892625f3a43a8290be6b625b5e54261a5.png",
    "price": 100
  },
  {
    "id": 34979,
    "name": "你真好看",
    "img": "https://s1.hdslb.com/bfs/live/24afbb083aa700d7576d60a1189d3505262d160d.png",
    "price": 1000
  },
  {
    "id": 34358,
    "name": "粉丝团灯牌",
    "img": "https://s1.hdslb.com/bfs/live/e051dfd4557678f8edcac4993ed00a0935cbd9cc.png",
    "price": 100
  },
  {
    "id": 31250,
    "name": "情书",
    "img": "https://s1.hdslb.com/bfs/live/14dafbf217618f0931c08897e0b3eefc00d0da22.png",
    "price": 5200
  },
  {
    "id": 34977,
    "name": "告白花束",
    "img": "https://s1.hdslb.com/bfs/live/a4aa89aaa24534cb77534680eaed1f5f2f9aa71f.png",
    "price": 19900
  },
  {
    "id": 34978,
    "name": "花式夸夸",
    "img": "https://s1.hdslb.com/bfs/live/28186596880db45a7b843f17d6ebb70feeac06f9.png",
    "price": 29900
  },
  {
    "id": 34961,
    "name": "爱心小熊",
    "img": "https://s1.hdslb.com/bfs/live/1a53270e7f8719dfe7796dbeb364b6326b4644fd.png",
    "price": 52000
  },
  {
    "id": 31217,
    "name": "星愿水晶球",
    "img": "https://s1.hdslb.com/bfs/live/288536798081e855e8f645bed6a2d2d27f411ee5.png",
    "price": 100000
  },
  {
    "id": 34980,
    "name": "告白气球",
    "img": "https://s1.hdslb.com/bfs/live/d4df99e01fe6dc69636742a998bfd2962480522e.png",
    "price": 200000
  },
  {
    "id": 34019,
    "name": "星轨列车",
    "img": "https://s1.hdslb.com/bfs/live/239c1e0c584b47601347812536422a37a5e3b3b9.png",
    "price": 666600
  },
  {
    "id": 34020,
    "name": "次元之城",
    "img": "https://s1.hdslb.com/bfs/live/cdae8136b1ee767609aeec688bca8124651d4d01.png",
    "price": 1245000
  },
  {
    "id": 34021,
    "name": "小电视飞船",
    "img": "https://s1.hdslb.com/bfs/live/3207208726805a14bced02f07c1e2b6a00a7ba10.png",
    "price": 2999000
  }
].map(p => [p.name, p]));

export const areaList = new Map([
  [0, "全部"],
  [9, "虚拟"],
  [1, "娱乐"],
  [5, "电台"],
  [15, "互动"],
  [10, "生活"],
  [13, "赛事"],
  [3, "手游"],
  [11, "知识"],
  [6, "单机"],
  [2, "网游"],
  [14, "聊天室"],
]);

export const requireGuardValue: Record<number, string> = {
  1: "总督",
  2: "提督",
  3: "舰长"
};