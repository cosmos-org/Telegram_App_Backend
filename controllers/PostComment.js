const PostModel = require("../models/Posts");
const PostCommentModel = require("../models/PostComment");
const FriendModel = require("../models/Friends");
const UserModel = require("../models/Users");
const httpStatus = require("../utils/httpStatus");
const postCommentController = {};
postCommentController.create = async (req, res, next) => {
    try {
        let userId = req.userId;
        let post;
        try {
            post = await PostModel.findById(req.params.postId);
            if (post == null) {
                return res.status(httpStatus.NOT_FOUND).json({message: "Can not find post"});
            }
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
        }const {
            content,
            commentAnswered
        } = req.body;

        const postComment = new PostCommentModel({
            user: userId,
            post: post._id,
            content: content,
            commentAnswered: commentAnswered ? commentAnswered : null
        });

        let postCommentSaved = await postComment.save();
        // update countComments post
        // console.log(req.params.postId)
        // console.log(post.countComments ? post.countComments + 1 : 1)
        let postSaved = await PostModel.findByIdAndUpdate(req.params.postId, {
            countComments: post.countComments ? post.countComments + 1 : 1
        })
        postCommentSaved = await PostCommentModel.findById(postCommentSaved._id).populate('user', [
            'username', 'phonenumber'
        ]);
        return res.status(httpStatus.OK).json({
            code:200,
            message:"Success",
            data: postCommentSaved,
            post: postSaved
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}

postCommentController.list = async (req, res, next) => {
    try {
       
        //get friends
        let requested = await FriendModel.find({sender: req.userId, status: "1" }).distinct('receiver')
        let accepted = await FriendModel.find({receiver: req.userId, status: "1" }).distinct('sender')
        let users_friends = await UserModel.find().where('_id').in(requested.concat(accepted)).exec()
        let users_friends_ids = users_friends.map(u => {
            return u._id
        })
        users_friends_ids.push(req.userId);
        
        let postComments = await PostCommentModel.find({
            $and: [
                    {
                        post: req.params.postId
                    },
                    {
                        user: {$in: users_friends_ids}
                    }
                ]
            }).populate('user', [
            'username', 'phonenumber'
        ]);
        return res.status(httpStatus.OK).json({
            code:200,
            message: "Success",
            data: postComments
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }

}


postCommentController.delete = async (req, res, next) => {
    try {
        let postComment = await PostCommentModel.findByIdAndDelete(req.params.id);
        if (postComment == null) {
            return res.status(httpStatus.NOT_FOUND).json({message: "Can not find comment"});
        }
        try {
            post = await PostModel.findById(postComment.post);
            if (post == null) {
                return res.status(httpStatus.NOT_FOUND).json({message: "Can not find post"});
            }
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
        }
        let postSaved = await PostModel.findByIdAndUpdate(postComment.post, {
            countComments: post.countComments ? post.countComments - 1 : 0
        })

        return res.status(httpStatus.OK).json({
            code: 200,
            message: 'Success',
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}

postCommentController.edit = async (req, res, next) => {
    try {
        let userId = req.userId;
    let comment_id = req.params.id;
    let new_content = req.body.content;
    let commentFind = await PostCommentModel.findById(comment_id);
    if (commentFind == null) {
        return res.status(httpStatus.NOT_FOUND).json({message: "Can not find comment"});
    }
    if (commentFind.user.toString() !== userId.toString()) {
        return res.status(httpStatus.FORBIDDEN).json({message: "Can not edit this comment"});
    }
    commentFind.content = new_content;
    await commentFind.save()
    return res.status(httpStatus.OK).json({
        code: 200,
        message:"Success",
        data: commentFind
    });
    } catch(error){
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
    
}
module.exports = postCommentController;