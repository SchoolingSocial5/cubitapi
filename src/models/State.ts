import mongoose, { Schema, Document } from 'mongoose';

export interface IState extends Document {
    name: string;
    country: string;
    countryId: mongoose.Types.ObjectId;
}

const stateSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'State name is required'],
        trim: true
    },
    country: {
        type: String,
        required: [true, 'Country name is required'],
        trim: true
    },
    countryId: {
        type: Schema.Types.ObjectId,
        ref: 'Country',
        required: [true, 'Country ID is required']
    }
}, {
    timestamps: true
});

// Create a compound index to ensure state names are unique within a country
stateSchema.index({ name: 1, countryId: 1 }, { unique: true });

const State = mongoose.model<IState>('State', stateSchema);

export default State;
