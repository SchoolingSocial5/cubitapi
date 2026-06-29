import mongoose, { Schema, Document } from 'mongoose';

export interface ICountry extends Document {
    name: string;
    countryCode: string;
    countrySymbol: string;
    currency: string;
    currencySymbol: string;
    countryFlag: string;
    coordinates: number[]; // [longitude, latitude]
}

const countrySchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Country name is required'],
        trim: true,
        unique: true
    },
    countryCode: {
        type: String,
        trim: true
    },
    countrySymbol: {
        type: String,
        trim: true
    },
    currency: {
        type: String,
        trim: true
    },
    currencySymbol: {
        type: String,
        trim: true
    },
    countryFlag: {
        type: String,
        trim: true
    },
    coordinates: {
        type: [Number],
        default: [0, 0]
    }
}, {
    timestamps: true
});

const Country = mongoose.model<ICountry>('Country', countrySchema);

export default Country;
