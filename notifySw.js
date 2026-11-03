self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const { roomId } = event.notification.data ?? {};

  if (event.action === "open" && roomId) {
    event.waitUntil(
      self.clients.openWindow(`https://live.bilibili.com/${roomId}`)
    );
  }
});
