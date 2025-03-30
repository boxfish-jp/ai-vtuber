import { getEventHandler } from "./handle_event/event_handler.js";
import { createServer } from "./handle_event/server.js";
import { getWorkFlowHandler } from "./work_flow/work_flow_handler.js";

const workFlow = getWorkFlowHandler();
const eventHandler = getEventHandler(workFlow);
const restPost = createServer(eventHandler);

export type restPostChatType = typeof restPost.appChatPost;
export type restPostWorkThemeType = typeof restPost.appWorkThemePost;
