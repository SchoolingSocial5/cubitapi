import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplate extends Document {
    name: string;
    subject?: string;
    content: string;
    type: 'email' | 'notification' | 'sms';
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TemplateSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a template name'],
            trim: true,
            maxlength: [100, 'Name cannot be more than 100 characters']
        },
        subject: {
            type: String,
            trim: true,
            maxlength: [200, 'Subject cannot be more than 200 characters']
        },
        content: {
            type: String,
            required: [true, 'Please add template content']
        },
        type: {
            type: String,
            required: [true, 'Please specify template type'],
            enum: ['email', 'notification', 'sms']
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<ITemplate>('Template', TemplateSchema);
