import mongoose, { Schema, Document } from 'mongoose';

export interface IPlace extends Document {
    landmark: string;
    area: string;
    state: string;
    country: string;
    continent: string;
    countryFlag: string;
    countryCode: string;
    countrySymbol: string;
    currency: string;
    currencySymbol: string;
}

const placeSchema: Schema = new Schema({
    landmark: {
        type: String,
        required: [true, 'Landmark is required'],
        trim: true
    },
    area: {
        type: String,
        required: [true, 'Area is required'],
        trim: true
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true
    },
    continent: {
        type: String,
        required: [true, 'Continent is required'],
        trim: true
    },
    countryFlag: String,
    countryCode: String,
    countrySymbol: String,
    currency: String,
    currencySymbol: String
}, {
    timestamps: true
});

// Add indices for performance on hierarchical queries
placeSchema.index({ country: 1 });
placeSchema.index({ country: 1, state: 1 });
placeSchema.index({ country: 1, state: 1, area: 1 });

const Place = mongoose.model<IPlace>('Place', placeSchema);

export default Place;
