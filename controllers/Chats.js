const {
    PRIVATE_CHAT,
    GROUP_CHAT,
} = require('../constants/constants');
const ChatModel = require("../models/Chats");
const MessagesModel = require("../models/Messages");
const httpStatus = require("../utils/httpStatus");
const chatController = {};

// function sortLastest(ls) {
//     ls.sort(function(first, second) {
//         return second.updatedAt - first.updatedAt;
//        });
//     return ls;
// };

chatController.send = async (req, res, next) => {
    try {
        let userId = req.userId;
        const {
            name,
            chatId,
            receivedId,
            member,
            type,
            content
        } = req.body;
        let chatIdSend = null;
        let chat;
        if (type === PRIVATE_CHAT) {
            if (chatId) {
                chat = await ChatModel.findById(chatId);
                if (chat !== null) {
                    chatIdSend = chat._id;
                }
            } else {
                chat = new ChatModel({
                   type: PRIVATE_CHAT,
                   member: [
                       receivedId,
                       userId
                   ]
                });
                await chat.save();
                chatIdSend = chat._id;
            }
        } else if (type === GROUP_CHAT) {
            if (chatId) {
                chat = await ChatModel.findById(chatId);
                if (chat !== null) {
                    chatIdSend = chat._id;
                }
            } else {
                chat = new ChatModel({
                    type: GROUP_CHAT,
                    member: member
                });
                await chat.save();
                chatIdSend = chat._id;
            }
        }
        if (chatIdSend) {
            if (content) {
                let message = new MessagesModel({
                    chat: chatIdSend,
                    user: userId,
                    content: content
                });
                await message.save();
                let messageNew = await MessagesModel.findById(message._id).populate('chat').populate('user');
                return res.status(httpStatus.OK).json({
                    code: 200,
                    message: "Success",
                    data: messageNew
                });
            } else {
                return res.status(httpStatus.OK).json({
                    code: 200,
                    message: "Success",
                    data: chat,
                    message: 'Create chat success',
                    response: 'CREATE_CHAT_SUCCESS'
                });
            }
        } else {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Not chat'
            });
        }

    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
chatController.getMessages = async (req, res, next) => {
    let perPage = 50; // số lượng message 1 trang
    let page = req.query.page || 0; 
    page = parseInt(page);
    try {
        let messages = await MessagesModel.find({
            chat: req.params.chatId
        }).sort({createdAt: -1}).skip(perPage * page)
        .limit(perPage).populate('user');; 
        return res.status(httpStatus.OK).json({
            code: 200,
            message: "Success",
            data: messages
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
};

chatController.getChats = async (req, res, next) => {
    try {
        let chats = await ChatModel.find({
            member: req.userId
        }).sort({updatedAt: -1});; 

        // chats = await sortLastest(chats);

        var newChats = await [];

        for (var element of chats ){
            
            let messages = await MessagesModel.find({
                chat: element._id
            }).sort({createdAt: -1});

            if (req.userId == messages[0].user) {
                sender = 0;
            } else {
                sender = 1;
            }
            var new_element = {
                member: element.member,
                type: element.type,
                _id: element._id,
                createdAt: element.createdAt,
                updatedAt: element.updatedAt,
                __v: element.__v,
                lastestMessage : messages[0].content,
                sender : sender
              }
            newChats.push(new_element);
        }

        return res.status(httpStatus.OK).json({
            code: 200,
            message: "Success",
            data: newChats
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}


module.exports = chatController;