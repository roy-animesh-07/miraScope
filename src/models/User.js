import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,

    email: { type: String, unique: true, sparse: true, lowercase: true },

    password: String, 
   apikey: {
    iv: String,
    content: String,
    tag: String,
  },

    provider: String, 
    providerId: String, 

    reports: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report"
    }],
    
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
