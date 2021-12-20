const friendController = require("../controllers/Friends");
const {asyncWrapper} = require("../utils/asyncWrapper");
const express = require("express");
const friendsRoutes = express.Router();
const ValidationMiddleware = require("../middlewares/validate");
const auth = require("../middlewares/auth");

friendsRoutes.post("/set-request-friend", auth, friendController.setRequest);
friendsRoutes.post("/get-requested-friend", auth, friendController.getRequest);
friendsRoutes.post("/get-sent-request", auth, friendController.getSentRequest);
friendsRoutes.post("/set-accept", auth, friendController.setAccept);
friendsRoutes.post("/set-remove", auth, friendController.setRemoveFriend);
friendsRoutes.post("/set-remove-request", auth, friendController.setRemoveRequest);
friendsRoutes.post("/list", auth, friendController.listFriends);
friendsRoutes.post("/getFriends", auth, friendController.getFriends);
module.exports = friendsRoutes;