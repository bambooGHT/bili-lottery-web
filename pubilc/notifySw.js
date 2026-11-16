self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data;
  console.log(data);

  if (event.action === "open" && data) {
    event.waitUntil(
      (async () => {
        const clients = await self.clients.matchAll({
          type: "window",
        });

        const client = clients[0];

        client.postMessage(data);
      })()
    );
  }
});
