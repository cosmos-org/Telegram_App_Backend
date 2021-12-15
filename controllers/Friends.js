const jwt = require("jsonwebtoken");
const UserModel = require("../models/Users");
const FriendModel = require("../models/Friends");
const ChatModel = require("../models/Chats");
const httpStatus = require("../utils/httpStatus");
const bcrypt = require("bcrypt");
const {JWT_SECRET} = require("../constants/constants");
const {ROLE_CUSTOMER} = require("../constants/constants");
const friendsController = {};
const {
    PRIVATE_CHAT,
    GROUP_CHAT,
} = require('../constants/constants');
// 0: gửi lời mời
// 1: kết bạn
// 2: từ chối
// 3: hủy kết bạn

friendsController.setRequest = async (req, res, next) => {
    try {
        let sender = req.userId;
        let receiver = req.body.user_id;
        let checkBack = await FriendModel.findOne({ sender: receiver, receiver: sender });
        if (checkBack != null) {
            if (checkBack.status == '0' || checkBack.status == '1') {
                return res.status(200).json({
                    code: 200,
                    status: 'error',
                    success: false,
                    message: "Đối phương đã gửi lời mời kết bạn hoặc đã là bạn",
                });
            }
            checkBack.status = '0';

        }

        let isFriend = await FriendModel.findOne({ sender: sender, receiver: receiver });
        if(isFriend != null){
            if (isFriend.status == '1') {
                return res.status(200).json({
                    code: 200,
                    success: false,
                    message: "Đã gửi lời mời kết bạn trước đó",
                });
            }

            isFriend.status = '0';
            isFriend.save();
            res.status(200).json({
                code: 200,
                message: "Gửi lời mời kết bạn thành công",
            });

        }else{
            let status = 0;
            const makeFriend = new FriendModel({ sender: sender, receiver: receiver, status: status });
            makeFriend.save();
            res.status(200).json({
                code: 200,
                message: "Success",
                data: makeFriend
            });
        }
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}

friendsController.getRequest = async (req, res, next) => {
    try {
        let receiver = req.userId;
        let requested = await FriendModel.find({receiver: receiver, status: "0" }).distinct('sender')
        let users = await UserModel.find().where('_id').in(requested).populate('avatar').populate('cover_image').exec()
   
        res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                friends: users,
            }
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}

friendsController.setAccept = async (req, res, next) => {
    try {
        let receiver = req.userId;
        let sender = req.body.user_id;
        let friend = await FriendModel.findOne({ sender: sender, receiver: receiver });

        if (req.body.is_accept != '1' && req.body.is_accept != '2') {
            res.status(200).json({
                code: 200,
                message: "Không đúng yêu cầu",
                data: friend,
                success: false
            });
        }
        if (friend.status == '1' && req.body.is_accept == '2') {
            res.status(200).json({
                code: 200,
                message: "Không đúng yêu cầu",
                data: friend,
                success: false

            });
        }

        friend.status = req.body.is_accept;
        friend.save();
        let mes;
        if (req.body.is_accept === '1') {
            mes = "Success accept";
            chat = new ChatModel({
                type: PRIVATE_CHAT,
                member: [
                    receiver,
                    sender
                ]});
                await chat.save();
        } else {
            mes = "Success refuse";
            chat = {}
        }

        res.status(200).json({
            code: 200,
            message: mes,
            data: {friend: friend,chat:chat},
            success: true,

        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}

friendsController.setRemoveFriend = async (req, res, next) => {
    try {
        let receiver = req.userId;
        let sender = req.body.user_id;

        let friendRc1 = await FriendModel.findOne({ sender: sender, receiver: receiver });
        let friendRc2 = await FriendModel.findOne({ sender: receiver, receiver: sender });
        let final;
        if (friendRc1 == null) {
            final = friendRc2;
        } else {
            final = friendRc1;
        }
        if (final.status != '1') {
            res.status(200).json({
                code: 200,
                success: false,
                message: "Khong thể thao tác",
            });
        }

        final.status = '3';
        final.save();

        res.status(200).json({
            code: 200,
            success: true,
            message: "Success delele friends",
            data: final
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}

friendsController.listFriends = async (req, res, next) => {
    try {
        if (req.body.user_id == null) {
            let requested = await FriendModel.find({sender: req.userId, status: "1" }).distinct('receiver')
            let accepted = await FriendModel.find({receiver: req.userId, status: "1" }).distinct('sender')

            let users = await UserModel.find().where('_id').in(requested.concat(accepted)).populate('avatar').populate('cover_image').exec()

            res.status(200).json({
                code: 200,
                message: "Success. Danh sách bạn bè",
                data: {
                    friends: users,
                }
            });
        }

    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}


module.exports = friendsController;