const chatController = require("../controllers/Chats");
const {asyncWrapper} = require("../utils/asyncWrapper");
const express = require("express");
const chatsRoutes = express.Router();
const auth = require("../middlewares/auth");

chatsRoutes.post(
    "/send",
    auth,
    asyncWrapper(chatController.send),
);

chatsRoutes.get(
    "/getMessages/:chatId",
    auth,
    asyncWrapper(chatController.getMessages),
);

chatsRoutes.get(
    "/getChats",
    auth,
    asyncWrapper(chatController.getChats),
);

chatsRoutes.get(
    "/getChatById/:chat_id",
    auth,
    asyncWrapper(chatController.getChatById),
);
chatsRoutes.get(
    "/getChatByUserId/:user_id",
    auth,
    asyncWrapper(chatController.getChatByUserId),
);
module.exports = chatsRoutes;