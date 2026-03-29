import { createServer } from "node:http";
import { createApp } from "./app.js";
import { PORT } from "./infra/constants.js";
import { logger } from "./infra/logger.js";

const app = await createApp();
const server = createServer(app);

server.listen(PORT, () => {
  logger.info(`signup backend listening on port ${PORT}`);
});
