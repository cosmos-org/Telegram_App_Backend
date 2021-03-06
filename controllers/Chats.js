const {
    PRIVATE_CHAT,
    GROUP_CHAT,
} = require('../constants/constants');
const ChatModel = require("../models/Chats");
const MessagesModel = require("../models/Messages");
const UserModel = require("../models/Users");
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
    let perPage = 50; // s??? l?????ng message 1 trang
    let page = req.query.page || 0; 
    page = parseInt(page);
    try {
        let messages = await MessagesModel.find({
            chat: req.params.chatId
        }).sort({createdAt: -1}).skip(perPage * page)
        .limit(perPage).populate('user').populate({
            path: 'user',
            select: '_id username phonenumber avatar',
            populate: {
                path: 'avatar'
            }
            }); 
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
        let currentUserId = req.userId;
        let chats = await ChatModel.find({
            member: req.userId
        }).sort({updatedAt: -1});; 

        // chats = await sortLastest(chats);

        var newChats = await [];

        for (var element of chats ){
    
            let finalId = element.member[0] == currentUserId? element.member[1] : element.member[0];
            let partnerUser = await UserModel.findOne({_id: finalId},{username: 1, avatar: 1, phonenumber: 1}).populate({path:'avatar',select: '_id type fileName'});
            let messages = await MessagesModel.find({
                chat: element._id
            }).sort({updatedAt: -1});
            let latestMessage;
            let sender;
            let lastMessageTime;
            if (messages.length == 0) {
                 latestMessage =  '';
                 sender =  1;
                 lastMessageTime = element.createdAt;
            }
            else {
                latestMessage =  messages[0].content;
                lastMessageTime = messages[0].createdAt;
                if (req.userId == messages[0].user) {
                    sender = 0;
                } else {
                    sender = 1;
                }
            }
            var new_element = {
                // partnerName: partnerUser.username,
                // partnerAvatar: partnerUser.avatar.fileName,
                partnerUser: partnerUser,
                member: element.member,
                type: element.type,
                _id: element._id,
                createdAt: element.createdAt,
                updatedAt: element.updatedAt,
                __v: element.__v,
                latestMessage : latestMessage,
                sender : sender,
                lastMessageTime: lastMessageTime
              }
            newChats.push(new_element);
        }
      

        newChats.sort(function(first, second) {
        return second.lastMessageTime - first.lastMessageTime;
        });
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

chatController.getChatById = async (req, res, next) => {
    try {
        let currentUserId = req.userId;
        let chatId = req.params.chat_id;
        let chat = await ChatModel.findById(chatId);
        if (!chat.member.includes(currentUserId)){
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Not your chat'
            });
        }
   
        let finalId = chat.member[0] == currentUserId? chat.member[1] : chat.member[0];
        let partnerUser = await UserModel.findOne({_id: finalId},{username: 1, avatar: 1, phonenumber: 1}).populate({path:'avatar',select: '_id type fileName'});
        let messages = await MessagesModel.find({
            chat: chat._id
        }).sort({updatedAt: -1});
        let latestMessage;
        let sender;
        let lastMessageTime;
        if (messages.length == 0) {
                latestMessage =  '';
                sender =  1;
                lastMessageTime = '';
        }
        else {
            latestMessage =  messages[0].content;
            lastMessageTime = messages[0].createdAt;
            if (req.userId == messages[0].user) {
                sender = 0;
            } else {
                sender = 1;
            }
        }
        var new_element = {
            partnerUser: partnerUser,
            member: chat.member,
            type: chat.type,
            _id: chat._id,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
            latestMessage : latestMessage,
            sender : sender,
            lastMessageTime: lastMessageTime
            }
    
        return res.status(httpStatus.OK).json({
            code: 200,
            message: "Success",
            data:  new_element

        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}

chatController.getChatByUserId = async (req, res, next) => {
    try {
        let currentUserId = req.userId;
        let user_id = req.params.user_id;
        if (currentUserId == user_id){
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'current user id and body user id cant be the same'
            });
        }
        let chat = await ChatModel.findOne({
                member: {$all: [currentUserId,user_id]}
        });
        
        if (!chat) {
            return res.status(httpStatus.NOT_FOUND).json({message: "Can not find chat by this user id"});
        }

        
        let partnerUser = await UserModel.findOne({_id: user_id},{username: 1, avatar: 1, phonenumber: 1}).populate({path:'avatar',select: '_id type fileName'});
        let messages = await MessagesModel.find({
            chat: chat._id
        }).sort({updatedAt: -1});
        let latestMessage;
        let sender;
        let lastMessageTime;
        if (messages.length == 0) {
                latestMessage =  '';
                sender =  1;
                lastMessageTime = '';
        }
        else {
            latestMessage =  messages[0].content;
            lastMessageTime = messages[0].createdAt;
            if (currentUserId == messages[0].user) {
                sender = 0;
            } else {
                sender = 1;
            }
        }
        var new_element = {
            partnerUser: partnerUser,
            member: chat.member,
            type: chat.type,
            _id: chat._id,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
            latestMessage : latestMessage,
            sender : sender,
            lastMessageTime: lastMessageTime
            }

        
        return res.status(httpStatus.OK).json({
            code: 200,
            message: "Success",
            data:  new_element

        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
module.exports = chatController;