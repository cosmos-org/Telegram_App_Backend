const jwt = require("jsonwebtoken");

const UserModel = require("../models/Users");
const FriendModel = require("../models/Friends");
const MessagesModel = require("../models/Messages");
const ChatModel = require("../models/Chats");
const httpStatus = require("../utils/httpStatus");
const bcrypt = require("bcrypt");
const {JWT_SECRET} = require("../constants/constants");
const {ROLE_CUSTOMER} = require("../constants/constants");
const friendsController = {};
var tdqm = require("ntqdm")();

const {
    PRIVATE_CHAT,
    GROUP_CHAT,
} = require('../constants/constants');
// 0: gửi lời mời
// 1: kết bạn
// 2: từ chối
// 3: hủy kết bạn
friendsController.fixFr = async (req, res, next) => {
    try {

        var frLs = await FriendModel.find({
        });
 
        console.log('find ' + frLs.length)
        
        var i = 0;
        
            for(let fr of frLs) {
                i = i + 1
                if (fr.receiver.toString() == fr.sender.toString() ) {
                    console.log('delete ');
                 await FriendModel.findByIdAndDelete(fr._id);
                 await ChatModel.deleteMany({
                     member: {$all: [fr.receiver,fr.receiver]}
                 });
                 continue;
                }
        }
    
        //handle current fr
    //     console.log('call')
    //    var frLs = await FriendModel.find({
        
    //    });
       
    //    console.log('find')
    //    console.log(frLs.length)
       
    //    var i = 0;
    //    for(let i in frLs) {

    //         for(let j in frLs) {
    //             if (i == j) continue;
    //             if( (frLs[i].sender == frLs[j].sender && frLs[i].receiver == frLs[j].receiver) || (frLs[i].receiver == frLs[j].sender && frLs[i].sender == frLs[j].receiver)){
    //                 console.log('lap')
    //                 console.log(frLs[i]._id + ' ' + frLs[j]._id);
                    
    //                 // var check =  await FriendModel.deleteOne({
    //                 //     _id: t_chat._id
    //                 //     })
    //             }
    //         }
          
    //     }
        
    // var frLs = await FriendModel.find({
    //     status: {
    //         '$ne':'1'
    //     }
    // });
    // console.log('find')
    // console.log(frLs.length)
    // var i = 0;
    // for(let fr of frLs) {
    //     // i = i + 1
    //     // // console.log(fr)
    //     // if (i % 100 == 0){
    //     //     console.log(i)
    //     // }
    //      let tempChatLs = await ChatModel.find({
    //            member: {$all: [fr.receiver,fr.sender]}
    //      });
         
    //      if (tempChatLs.length > 0) { //if there are chats for non friend ussers
    //         console.log('Chat between not friend user');
    //          for (var t_chat of tempChatLs){
            
    //              deleteMsgCheck =  await MessagesModel.deleteMany(
    //                  {
    //                      chat: t_chat._id
    //                  }
    //              )
    //              check =  await ChatModel.deleteMany({
    //                  _id: t_chat._id
    //                  }
    //              )
                 
                
    //          }
    //      }
    //  }

        res.status(200).json({
            code: 200,
            message: "Success",
        
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}

friendsController.fixDb = async (req, res, next) => {
    try {
        //handle current fr
        
    //    var frLs = await FriendModel.find({
    //        status: "1"
    //    });

    //    console.log('find ' + frLs.length)
       
    //    var i = 0;
    //    for(let fr of frLs) {
    //        i = i + 1
    //        if (fr.receiver.toString() == fr.sender.toString() ) {
    //            console.log('delete ');
    //         await FriendModel.findByIdAndDelete(fr._id);
    //         await ChatModel.deleteMany({
    //             member: {$all: [fr.receiver,fr.receiver]}
    //         });
    //         continue;
    //        }
    //        if (i % 100 == 0){
    //            console.log(i)
    //        }
    //     //    console.log(fr.receiver + ' ' + fr.sender)
    //         let tempChatLs = await ChatModel.find({
    //             member: {$all: [fr.receiver,fr.sender]}
    //         });
    //         if (tempChatLs.length == 0 ) {
    //             //add chat
    //             console.log('no chat for a couple of friend')
    //             chat = new ChatModel({
    //                 type: PRIVATE_CHAT,
    //                 member: [
    //                     fr.receiver,
    //                     fr.sender
    //             ]});
    //             await chat.save();
               
    //         };
    //         if (tempChatLs.length > 1) { //if multi chat for a friend relation
    //             console.log('multi chat for a couple of friend');
                
    //             for (var t_chat of tempChatLs){
                
    //                 var deleteMsgCheck =  await MessagesModel.deleteMany(
    //                     {
    //                         chat: t_chat._id
    //                     }
    //                 );
    //                 let c = await ChatModel.findByIdAndDelete(t_chat._id);
    //                 if (c == null) {
    //                     console.log('delete fail');
    //                 }         
    //             }
    //         //add one chat
    //             n_chat = new ChatModel({
    //                 type: PRIVATE_CHAT,
    //                 member: [
    //                     fr.receiver,
    //                     fr.sender
    //             ]});
    //             await n_chat.save()
    //         }
           
    //     }
    //     console.log('re check');
        
    var frLs = await FriendModel.find({
        status: {
            '$ne':'1'
        }
    });
    console.log('find')
    console.log(frLs.length)
    var i = 0;
    for(let fr of frLs) {
        i = i + 1
        // console.log(fr)
        if (i % 100 == 0){
            console.log(i)
        }
         let tempChatLs = await ChatModel.find({
               member: {$all: [fr.receiver,fr.sender]}
         });
         
         if (tempChatLs.length > 0) { //if there are chats for non friend ussers
            console.log('Chat between not friend user');
             for (var t_chat of tempChatLs){
            
                 deleteMsgCheck =  await MessagesModel.deleteMany(
                     {
                         chat: t_chat._id
                     }
                 )
                 check =  await ChatModel.deleteMany({
                     _id: t_chat._id
                     }
                 )
                 
                
             }
         }
     }

        res.status(200).json({
            code: 200,
            message: "Success",
        
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}

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
friendsController.getSentRequest = async (req, res, next) => {
    try {
        let sender = req.userId;
        let requested = await FriendModel.find({sender: sender, status: "0" }).distinct('receiver')
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
            let finalId = chat.member[0] == receiver? chat.member[1] : chat.member[0];
            let partnerUser = await UserModel.findOne({_id: finalId},{username: 1, avatar: 1, phonenumber: 1}).populate({path:'avatar',select: '_id type fileName'});
            
            var new_chat = {
            // partnerName: partnerUser.username,
            // partnerAvatar: partnerUser.avatar.fileName,
            partnerUser: partnerUser,
            member: chat.member,
            type: chat.type,
            _id: chat._id,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
            latestMessage : '',
            sender : 1,
            lastMessageTime: ''
            }
        } else {
            console.log('refuse')
            
            mes = "Success refuse";
            new_chat = {}
        }

        res.status(200).json({
            code: 200,
            message: mes,
            data: {friend: friend,chat:new_chat},
            success: true,

        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}

friendsController.setRemoveRequest = async (req, res, next) => {
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
        if (final.status != '0') {
            res.status(200).json({
                code: 200,
                success: false,
                message: "Cannot commit",
            });
        }

        final.status = '2';
        final.save();

        res.status(200).json({
            code: 200,
            success: true,
            message: "Success delele friends request",
            data: final
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}

friendsController.setRemoveFriend = async (req, res, next) => {
    try {
        console.log('remove')
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

        let curentChatLs = await ChatModel.find({
            member: {$all: [final.receiver,final.sender]}
         });
        
        
        // console.log(curentChatLs)
        for (var chat in curentChatLs){
            console.log(chat._id)
            deleteMsgCheck =  MessagesModel.deleteMany(
                {
                    chat: chat._id
                }
            )
            check =  ChatModel.deleteMany({
                _id: chat._id
                }
            )
            
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

friendsController.getFriends = async (req, res, next) => {
    try {
        let user_id = req.body.user_id;

        let requested = await FriendModel.find({sender: user_id, status: "1" }).distinct('receiver')
        let accepted = await FriendModel.find({receiver: user_id, status: "1" }).distinct('sender')

        let friends = await UserModel.find().where('_id').in(requested.concat(accepted)).populate('avatar').populate('cover_image').exec()

        res.status(200).json({
            code: 200,
            message: "Success. Danh sách bạn bè theo user id",
            data: {
                friends: friends,
            }
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
module.exports = friendsController;