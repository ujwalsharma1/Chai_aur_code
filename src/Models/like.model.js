import mongoose , {Schema} from "mongoose";

const likeSchema = new Schema({
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    likeBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

const Like = mongoose.model("Like" , likeSchema)

export {Like}

