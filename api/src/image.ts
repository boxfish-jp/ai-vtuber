import { Hono } from "hono";

type Bindings = {
	r2_storage: R2Bucket;
};

export const image = new Hono<{ Bindings: Bindings }>();

image.get("/:filename", async (c) => {
	const filename = c.req.param("filename");
	const object = await c.env.r2_storage.get(filename);
	if (!object) return c.notFound();
	const data = await object.arrayBuffer();
	const contentType = object.httpMetadata?.contentType ?? "";

	return c.body(data, 200, {
		"Content-Type": contentType,
	});
});

image.post("/", async (c) => {
	const body = await c.req.parseBody();
	const file = body.upload as File;
	const bucket = c.env.r2_storage;
	const filename = `${new Date().getTime().toString()}.png`;
	await bucket.put(filename, await file.arrayBuffer(), {
		httpMetadata: { contentType: file.type },
	});

	return c.text(filename);
});
