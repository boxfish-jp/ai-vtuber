import { Hono } from "hono";
import { image } from "./image";

const app = new Hono();

app.get("/", (c) => c.text("hello"))
app.route("/image", image)

export default app;
