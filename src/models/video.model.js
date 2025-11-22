import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new mongoose.Schema({
  title: { 
    type: String 
  },
  description: {
     type: String
    },
  videoUrl: {
     type: String,
      required: true 
    },
  owner: { 
    type: mongoose.Types.ObjectId,
     ref: "User" },
     likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: []
}]

}, 
{ timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate);

export const Video= mongoose.model("Video", videoSchema);