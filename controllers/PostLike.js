const httpStatus = require("../utils/httpStatus");
const PostModel = require("../models/Posts");

const postLikeController = {};

postLikeController.action = async (req, res, next) => {
    try {
        let userId = req.userId;
        let post = await PostModel.findById(req.params.postId);
        // console.log(userId)
        // console.log(post)
        if (post == null) {
            return res.status(httpStatus.NOT_FOUND).json({message: "Can not find post"});
        }

        let arrLike = post.like;
        let arrLikeNotContainCurrentUser = arrLike.filter((item) => {
            return item != userId
        });
        if (arrLikeNotContainCurrentUser.length === arrLike.length) {
            arrLike.push(userId);
        } else {
            arrLike = arrLikeNotContainCurrentUser;
        }
        post = await PostModel.findOneAndUpdate({_id: req.params.postId}, {
            like: arrLike
        }, {
            new: true,
            runValidators: true
        }).populate('like', ['username', 'phonenumber']);

        if (!post) {
            return res.status(httpStatus.NOT_FOUND).json({message: "Can not find post"});
        }
        post.isLike = post.like.includes(req.userId);
        // console.log(post.isLike)
        return res.status(httpStatus.OK).json({
            code:200,
            message: "Success",
            data: post
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
}

module.exports = postLikeController;