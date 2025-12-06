import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            required: true,
        },
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
        reason: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "resolved", "dismissed"],
            default: "pending",
        },
        adminNotes: {
            type: String,
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
        },
        reviewedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Index for easy lookup
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });

const Report = mongoose.model("Report", reportSchema);
export default Report;
