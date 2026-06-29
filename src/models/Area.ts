import mongoose, { Schema, Document } from 'mongoose';

export interface IArea extends Document {
    name: string;
    country: string;
    state: string;
    zipCode: string;
    countryId: mongoose.Types.ObjectId;
    stateId: mongoose.Types.ObjectId;
}

const areaSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Area name is required'],
        trim: true
    },
    country: {
        type: String,
        required: [true, 'Country name is required'],
        trim: true
    },
    state: {
        type: String,
        required: [true, 'State name is required'],
        trim: true
    },
    zipCode: {
        type: String,
        trim: true
    },
    countryId: {
        type: Schema.Types.ObjectId,
        ref: 'Country',
        required: [true, 'Country ID is required']
    },
    stateId: {
        type: Schema.Types.ObjectId,
        ref: 'State',
        required: [true, 'State ID is required']
    }
}, {
    timestamps: true
});

// Create a compound index to ensure area names are unique within a state
areaSchema.index({ name: 1, stateId: 1 }, { unique: true });

const Area = mongoose.model<IArea>('Area', areaSchema);

export default Area;
