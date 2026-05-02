import mongoose from "mongoose";

const eventGallerySchema = new mongoose.Schema({
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Event",
    required: true 
  },
  imageUrl: {
    type: String,
    required: true,
  },
  caption: String,
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "MasterUser" 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

export default mongoose.model("EventGallery", eventGallerySchema);
