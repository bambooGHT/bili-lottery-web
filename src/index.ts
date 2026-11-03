import { createApp, h } from "vue";
import { ViewBox } from "./views";

import "./default.scss";
import "./index.scss";
import "./views/icon/icon.scss";
import "./views/header/headerBox.scss";
import "./views/roomList/roomListBox.scss";

const app = createApp({
  setup() {
    return () => h(ViewBox);
  }
});

app.mount("body");
