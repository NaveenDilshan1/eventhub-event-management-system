import EventGallery from "../models/EventGallery.js";
import Event from "../models/Event.js";

/**
 * Upload image to event gallery
 */
export const uploadGalleryImage = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { caption } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is event creator or admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const imageUrl = `/uploads/events/${req.file.filename}`;

    const gallery = await EventGallery.create({
      eventId,
      imageUrl,
      caption: caption || "",
      uploadedBy: req.user.id,
    });

    res.status(201).json({
      message: "Image uploaded to gallery",
      image: {
        id: gallery._id,
        imageUrl: gallery.imageUrl,
        caption: gallery.caption,
        createdAt: gallery.createdAt,
      },
    });
  } catch (err) {
    console.error("Error uploading gallery image:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get event gallery images
 */
export const getEventGallery = async (req, res) => {
  try {
    const { eventId } = req.params;

    const gallery = await EventGallery.find({ eventId })
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "firstName lastName");

    res.json(gallery);
  } catch (err) {
    console.error("Error fetching gallery:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete gallery image
 */
export const deleteGalleryImage = async (req, res) => {
  try {
    const { eventId, imageId } = req.params;

    const image = await EventGallery.findById(imageId);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Check if user is image uploader or admin
    if (image.uploadedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await EventGallery.findByIdAndDelete(imageId);

    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("Error deleting gallery image:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update gallery image caption
 */
export const updateGalleryCaption = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { caption } = req.body;

    const image = await EventGallery.findById(imageId);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Check if user is image uploader or admin
    if (image.uploadedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    image.caption = caption || "";
    await image.save();

    res.json({
      message: "Caption updated",
      image: image,
    });
  } catch (err) {
    console.error("Error updating caption:", err);
    res.status(500).json({ message: "Server error" });
  }
};
