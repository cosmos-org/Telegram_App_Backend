const jwt = require("jsonwebtoken");
const UserModel = require("../models/Users");
const DocumentModel = require("../models/Documents");
const FriendModel = require("../models/Friends");
const httpStatus = require("../utils/httpStatus");
const bcrypt = require("bcrypt");
const {JWT_SECRET} = require("../constants/constants");
const uploadFile = require('../functions/uploadFile');
const usersController = {};

usersController.register = async (req, res, next) => {
    try {
        
        const {
            phonenumber,
            password,
            username,
        } = req.body;

        let user = await UserModel.findOne({
            phonenumber: phonenumber
        })
        
        if (user) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Phone number already exists'
            });
        }
        //Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        let avatar  = await DocumentModel.findById("61896e3633a1813c6c3c0164");
        let coverImage  = await DocumentModel.findById("61896e6fbc3d2f4014b28b34");
        user = new UserModel({
            phonenumber: phonenumber,
            password: hashedPassword,
            username: username,
            avatar: "61896e3633a1813c6c3c0164",
            cover_image: "61896e6fbc3d2f4014b28b34"
        });

        try {
            const savedUser = await user.save();

            // login for User
            // create and assign a token
            const token = jwt.sign(
                {username: savedUser.username, firstName: savedUser.firstName, lastName: savedUser.lastName, id: savedUser._id},
                JWT_SECRET
            );
            res.status(httpStatus.CREATED).json({
                data: {
                    _id: savedUser._id,
                    phonenumber: savedUser.phonenumber,
                    username: savedUser.username,
                    avatar: avatar,
                    cover_image: coverImage,
                },
                token: token
            })
        } catch (e) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: e.message
            });
        }
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
usersController.login = async (req, res, next) => {
    try {
        const {
            phonenumber,
            password
        } = req.body;
        const user = await UserModel.findOne({
            phonenumber: phonenumber
        })
        if (!user) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Username or password incorrect'
            });
        }

        // password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Username or password incorrect'
            });
        }

        // login success

        // create and assign a token
        const token = jwt.sign(
            {username: user.username, firstName: user.firstName, lastName: user.lastName, id: user._id},
            JWT_SECRET
        );
        delete user["password"];
        return res.status(httpStatus.OK).json({
            data: {
                _id: user._id,
                phonenumber: user.phonenumber,
                username: user.username,
            },
            token: token
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
usersController.edit = async (req, res, next) => {
    try {
        let userId = req.userId;
        let user;
        const {
            avatar,
            cover_image,
        } = req.body;
        const dataUserUpdate = {};
        const listPros = [
            "username",
            "gender",
            "birthday",
            "description",
            "address",
            "city",
            "country",
            "avatar",
            "cover_image"
        ];
        for (let i = 0; i < listPros.length; i++) {
            let pro = listPros[i];
            if (req.body.hasOwnProperty(pro)) {
                switch (pro) {
                    case "avatar":
                        let savedAvatarDocument = null;
                        if (uploadFile.matchesFileBase64(avatar) !== false) {
                            const avatarResult = uploadFile.uploadFile(avatar);
                            if (avatarResult !== false) {
                                let avatarDocument = new DocumentModel({
                                    fileName: avatarResult.fileName,
                                    fileSize: avatarResult.fileSize,
                                    type: avatarResult.type
                                });
                                savedAvatarDocument = await avatarDocument.save();
                            }
                        } else {
                            savedAvatarDocument = await DocumentModel.findById(avatar);
                        }
                        dataUserUpdate[pro] = savedAvatarDocument !== null ? savedAvatarDocument._id : null;
                        break;
                    case "cover_image":
                        let savedCoverImageDocument = null;
                        if (uploadFile.matchesFileBase64(cover_image) !== false) {
                            const coverImageResult = uploadFile.uploadFile(cover_image);
                            if (coverImageResult !== false) {
                                let coverImageDocument = new DocumentModel({
                                    fileName: coverImageResult.fileName,
                                    fileSize: coverImageResult.fileSize,
                                    type: coverImageResult.type
                                });
                                savedCoverImageDocument = await coverImageDocument.save();
                            }
                        } else {
                            savedCoverImageDocument = await DocumentModel.findById(cover_image);
                        }
                        dataUserUpdate[pro] = savedCoverImageDocument !== null ? savedCoverImageDocument._id : null;
                        break;
                    default:
                        dataUserUpdate[pro] = req.body[pro];
                        break;
                }
            }
        }


        user = await UserModel.findOneAndUpdate({_id: userId}, dataUserUpdate, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({message: "Can not find user"});
        }
        user = await UserModel.findById(userId).select('phonenumber username gender birthday avatar cover_image blocked_inbox blocked_diary').populate('avatar').populate('cover_image');
        return res.status(httpStatus.OK).json({
            code:200,
            message: "Success",
            data: user
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
usersController.changePassword = async (req, res, next) => {
    try {
        let userId = req.userId;
        let  user = await UserModel.findById(userId);
        if (user == null) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: "UNAUTHORIZED"
            });
        }
        const {
            currentPassword,
            newPassword,
        } = req.body;
        // password
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Current password incorrect',
                code: 'CURRENT_PASSWORD_INCORRECT'
            });
        }

        //Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        user = await UserModel.findOneAndUpdate({_id: userId}, {
            password: hashedNewPassword
        }, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({message: "Can not find user"});
        }

        // create and assign a token
        const token = jwt.sign(
            {username: user.username, firstName: user.firstName, lastName: user.lastName, id: user._id},
            JWT_SECRET
        );
        user = await UserModel.findById(userId).select('phonenumber username gender birthday avatar cover_image blocked_inbox blocked_diary').populate('avatar').populate('cover_image');
        return res.status(httpStatus.OK).json({
            data: user,
            token: token
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message,
        });
    }
}
usersController.show = async (req, res, next) => {
    try {
        let userId = null;
        if (req.params.id) {
            userId = req.params.id;
        } else {
            userId = req.userId;
        }
        // console.log(userId)
        let user = await UserModel.findById(userId).populate('avatar').populate('cover_image');
        if (user == null) {
            return res.status(httpStatus.NOT_FOUND).json({message: "Can not find user"});
        }

        return res.status(httpStatus.OK).json({
            code:200,
            message: "Success",
            data: user
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}
usersController.setBlock = async (req, res, next) => {
    try {
        let targetId = req.body.user_id;
        let type = req.body.type;

      
    

        let user = await UserModel.findById(req.userId);
        blocked = []
        if (user.blocked_inbox !== undefined) {
            
            blocked = user.blocked_inbox
        }
    
        if(type) {
     
            if(blocked.indexOf(targetId) === -1) {
                
                blocked.push(targetId);
            }
            let friendRc1 = await FriendModel.findOne({ sender: targetId, receiver:  req.userId });
            let friendRc2 = await FriendModel.findOne({ sender: req.userId, receiver: targetId });
            let final;
            if (friendRc1 == null) {
                final = friendRc2;
            } else {
                final = friendRc1;
            }
            if (final != null)
            {
                final.status = '3';
                final.save();
            }
        } else {
            const index = blocked.indexOf(targetId);
            if (index > -1) {
                blocked.splice(index, 1);
            }
        }
        
        user.blocked_inbox = blocked;
        await user.save();

        // remove friend and friend request here


        res.status(200).json({
            code: 200,
            message: "Success",
            data: user
        });

    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
usersController.setBlockDiary = async (req, res, next) => {
    try {
        let targetId = req.body.user_id;
        let type = req.body.type;
        let user = await UserModel.findById(req.userId);
        blocked = []
        if (user.hasOwnProperty('blocked')) {
            blocked = user.blocked_diary
        }
    
        if(type) {
     
            if(blocked.indexOf(targetId) === -1) {
                blocked.push(targetId);
            }
        } else {
            const index = blocked.indexOf(targetId);
            if (index > -1) {
                blocked.splice(index, 1);
            }
        }

        user.blocked_diary = blocked;
        user.save();

        res.status(200).json({
            code: 200,
            message: "Success",
            data: user
        });

    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
usersController.getBlockedUsers = async (req, res, next) => {
    try {
        let userId = req.userId;
        let user = await UserModel.findById(userId);
        let blocked_list = user.blocked_inbox;
        let result = [];
        for (var blocked_id of blocked_list ){
            let t_user = await UserModel.findById(blocked_id).populate('avatar').populate('cover_image');
            result.push(t_user);
        }
        res.status(200).json({
            code: 200,
            message: "Success",
            data: result
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
usersController.searchUser = async (req, res, next) => {
    try {
        let userId = req.userId;
        let user = await UserModel.findById(userId);
        let blocked_list = user.blocked_inbox;
        let searchKey = new RegExp(req.body.keyword.toLowerCase(), 'i')
        let result = await UserModel.find( { $and : [
            {
                    $or:
                    [ 
                        {phonenumber: { "$regex": searchKey }} ,
                        {username: { "$regex": searchKey }}
                    ] 
            },
            {
                _id: {$nin : blocked_list}
            }
        ]}).populate('avatar').populate('cover_image').exec();
        
        res.status(200).json({
            code: 200,
            message: "Success",
            data: result
        });

    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}

module.exports = usersController;