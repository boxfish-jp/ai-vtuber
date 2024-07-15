import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { sendAPI } from "./sendAPI";
import { createChat, makeLatestAsCleared } from "../message/opeMess";
import { talkMateEndpoint } from "../endpoint";

export const startServer = () => {
  const app = new Hono();

  app.get("/", async (c) => {
    const response = await sendAPI();
    await createChat("ai", response);
    return c.text(response);
  });

  app.get("/clear", async (c) => {
    const result = await makeLatestAsCleared();
    return c.text(`cleared: ${result}`);
  });

  console.log(
    `Server is running on  localhost:${Number(talkMateEndpoint.port)}`
  );

  serve({
    fetch: app.fetch,
    hostname: talkMateEndpoint.ip,
    port: Number(talkMateEndpoint.port),
  });
};
