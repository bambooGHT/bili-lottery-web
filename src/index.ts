import { createApp, h } from "vue";
import { ViewBox } from "./views";

import "./default.scss";
import "./index.scss";
import "./views/header/headerBox.scss";
import "./views/roomList/roomListBox.scss";
import "./views/components/icon/icon.scss";
import "./views/components/input/input.scss";

import 'tdesign-vue-next/es/style/index.css';

const app = createApp({
  setup() {
    return () => h(ViewBox);
  }
});

app.mount("body");
