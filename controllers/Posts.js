const jwt = require("jsonwebtoken");
const UserModel = require("../models/Users");
const PostModel = require("../models/Posts");
const FriendModel = require("../models/Friends");
const DocumentModel = require("../models/Documents");
var url = require('url');
const httpStatus = require("../utils/httpStatus");
const bcrypt = require("bcrypt");
const {JWT_SECRET} = require("../constants/constants");
const {ROLE_CUSTOMER} = require("../constants/constants");
const uploadFile = require('../functions/uploadFile');  
    const postsController = {};

postsController.create = async (req, res, next) => {
    // console.log('create post --- ')
    let userId = req.userId;
   
    // console.log(req.body)
    try {
        const {
            described,
            images,
            videos,
        } = req.body;
        // console.log(req.body)
        console.log(described)
        // console.log(images)
        // console.log(videos)

        let dataImages = [];
        if (Array.isArray(images)) {
            for (const image of images) {
                if (uploadFile.matchesFileBase64(image) !== false) {
                    const imageResult = uploadFile.uploadFile(image);
                    if (imageResult !== false) {
                        let imageDocument = new DocumentModel({
                            fileName: imageResult.fileName,
                            fileSize: imageResult.fileSize,
                            type: imageResult.type
                        });
                        let savedImageDocument = await imageDocument.save();
                        if (savedImageDocument !== null) {
                            dataImages.push(savedImageDocument._id);
                        }
                    }
                }
            }
        }

        let dataVideos = [];
        if (Array.isArray(videos)) {
            for (const video of videos) {
                console.log('duyet video')
                if (uploadFile.matchesFileBase64(video) !== false) {
                    const videoResult = uploadFile.uploadFile(video);
                    if (videoResult !== false) {
                        let videoDocument = new DocumentModel({
                            fileName: videoResult.fileName,
                            fileSize: videoResult.fileSize,
                            type: videoResult.type
                        });
                        let savedVideoDocument = await videoDocument.save();
                        if (savedVideoDocument !== null) {
                            dataVideos.push(savedVideoDocument._id);
                        }
                    }
                }
            }
        }

        const post = new PostModel({
            author: userId,
            described: described,
            images: dataImages,
            videos: dataVideos,
            countComments: 0
        });
        let postSaved = (await post.save()).populate('images').populate('videos');
        postSaved = await PostModel.findById(postSaved._id).populate('images', ['fileName']).populate('videos', ['fileName']).populate({
            path: 'author',
            select: '_id username phonenumber avatar',
            model: 'Users',
            populate: {
                path: 'avatar',
                select: '_id fileName',
                model: 'Documents',
            },
        });
        return res.status(httpStatus.OK).json({
            code: 200,
            message:"Success",
            data: postSaved
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
postsController.edit = async (req, res, next) => {
    try {
        let userId = req.userId;
        let postId = req.params.id;
        let postFind = await PostModel.findById(postId);
        if (postFind == null) {
            return res.status(httpStatus.NOT_FOUND).json({message: "Can not find post"});
        }
        if (postFind.author.toString() !== userId) {
            return res.status(httpStatus.FORBIDDEN).json({message: "Can not edit this post"});
        }

        const {
            described,
            images,
            videos,
        } = req.body;
        let dataImages = [];
        if (Array.isArray(images)) {
            for (const image of images) {
                // check is old file
                if (image) {
                    let imageFile = !image.includes('data:') ? await DocumentModel.findById(image) : null;
                    if (imageFile == null) {
                        if (uploadFile.matchesFileBase64(image) !== false) {
                            const imageResult = uploadFile.uploadFile(image);
                            if (imageResult !== false) {
                                let imageDocument = new DocumentModel({
                                    fileName: imageResult.fileName,
                                    fileSize: imageResult.fileSize,
                                    type: imageResult.type
                                });
                                let savedImageDocument = await imageDocument.save();
                                if (savedImageDocument !== null) {
                                    dataImages.push(savedImageDocument._id);
                                }
                            }
                        }
                    } else {
                        dataImages.push(image);
                    }
                }
            }
        }

        let dataVideos = [];
        if (Array.isArray(videos)) {
            for (const video of videos) {
                // check is old file
                if (video) {
                    let videoFile = !video.includes('data:') ? await DocumentModel.findById(video) : null;
                    if (videoFile == null) {
                        if (uploadFile.matchesFileBase64(video) !== false) {
                            const videoResult = uploadFile.uploadFile(video);
                            if (videoResult !== false) {
                                let videoDocument = new DocumentModel({
                                    fileName: videoResult.fileName,
                                    fileSize: videoResult.fileSize,
                                    type: videoResult.type
                                });
                                let savedVideoDocument = await videoDocument.save();
                                if (savedVideoDocument !== null) {
                                    dataVideos.push(savedVideoDocument._id);
                                }
                            }
                        }
                    }
                }
            }
        }


        let postSaved = await PostModel.findByIdAndUpdate(postId, {
            described: described,
            images: dataImages,
            videos: dataVideos,
        });
        postSaved = await PostModel.findById(postSaved._id).populate('images', ['fileName']).populate('videos', ['fileName']).populate({
            path: 'author',
            select: '_id username phonenumber avatar',
            model: 'Users',
            populate: {
                path: 'avatar',
                select: '_id fileName',
                model: 'Documents',
            },
        });
        return res.status(httpStatus.OK).json({
            code: 200,
            message:"Success",
            data: postSaved
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
postsController.show = async (req, res, next) => {
    try {
        let post = await PostModel.findById(req.params.id).populate('images', ['fileName']).populate('videos', ['fileName']).populate({
            path: 'author',
            select: '_id username phonenumber avatar',
            model: 'Users',
            populate: {
                path: 'avatar',
                select: '_id fileName',
                model: 'Documents',
            },
        });
        if (post == null) {
            return res.status(httpStatus.NOT_FOUND).json({message: "Can not find post"});
        }
        post.isLike = post.like.includes(req.userId);
        return res.status(httpStatus.OK).json({
            data: post,
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}
postsController.delete = async (req, res, next) => {
    try {
        let post = await PostModel.findByIdAndDelete(req.params.id);
        if (post == null) {
            return res.status(httpStatus.NOT_FOUND).json({message: "Can not find post"});
        }
        return res.status(httpStatus.OK).json({
            code: 200,
            message: 'Success',
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}

postsController.list = async (req, res, next) => {
    let perPage = 5; // số lượng post 1 trang
    let page = req.query.page || 0; 
    page = parseInt(page);
    try {
        let posts = [];
        let userId = req.userId;
        if (req.query.userId) {
            // get Post of one user

             //get friends
            let requested = await FriendModel.find({sender: req.userId, status: "1" }).distinct('receiver')
            let accepted = await FriendModel.find({receiver: req.userId, status: "1" }).distinct('sender')
            let users_friends = await UserModel.find().where('_id').in(requested.concat(accepted)).exec()
            let users_friends_ids = users_friends.map(u => {
                return u._id
            })
            
            if (!users_friends_ids.includes(req.query.userId) && req.query.userId != req.userId){
                posts = [];
            }
            
            else {
                posts = await PostModel.find({
                    author: req.query.userId
                }).populate('images', ['fileName']).populate('videos', ['fileName']).populate({
                    path: 'author',
                    select: '_id username phonenumber avatar',
                    model: 'Users',
                    populate: {
                        path: 'avatar',
                        select: '_id fileName',
                        model: 'Documents',
                    },
                }).sort({createdAt: -1}).skip(perPage * page)
                .limit(perPage);
            }

        } else {

            
            // get list friend of 1 user
            let friends = await FriendModel.find({
                status: "1",
            }).or([
                {
                    sender: userId
                },
                {
                    receiver: userId
                }
            ])
            let listIdFriends = [];
            // console.log(friends)
            for (let i = 0; i < friends.length; i++) {
                if (friends[i].sender.toString() === userId.toString()) {
                    listIdFriends.push(friends[i].receiver);
                } else {
                    listIdFriends.push(friends[i].sender);
                }
            }
            listIdFriends.push(userId);
            // console.log(listIdFriends);
            // get post of friends of 1 user
            posts = await PostModel.find({
                "author": listIdFriends
            }).populate('images', ['fileName']).populate('videos', ['fileName']).populate({
                path: 'author',
                select: '_id username phonenumber avatar',
                model: 'Users',
                populate: {
                    path: 'avatar',
                    select: '_id fileName',
                    model: 'Documents',
                },
            }).sort({createdAt: -1}).skip(perPage * page)
            .limit(perPage);
           
        }
        let postWithIsLike = [];
        for (let i = 0; i < posts.length; i ++) {
            let postItem = posts[i];
            postItem.isLike = postItem.like.includes(req.userId);
            postWithIsLike.push(postItem);
        }
        // postWithIsLike = sortLastest(postWithIsLike);
        return res.status(httpStatus.OK).json({
            code: 200,
            message: 'Success',
            data: postWithIsLike
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}

postsController.searchPosts = async (req, res, next) => {
    try {
        let searchKey = new RegExp(req.body.keyword.toLowerCase(), 'i')
        let result = await PostModel.find({described:  { "$regex": searchKey }}).limit(10).populate({
            path: 'author',
            populate: { path: 'avatar' }
          }).populate('images').populate('videos').exec();
        
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


module.exports = postsController;