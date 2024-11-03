import { watchComment } from "./comment/watchComment";
import { startServer } from "./server/server";
import { watchVoice } from "./voice/watchVoice";

watchVoice();
watchComment();
startServer();
