import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Auction from './src/models/Auction';
import Listing from './src/models/Listing';

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('Connected to MongoDB');

        const auctions = await Auction.find({ slug: { $exists: false } });
        console.log(`Found ${auctions.length} auctions without slug`);

        for (const auction of auctions) {
            const property = await Listing.findById(auction.propertyId);
            if (property && property.slug) {
                auction.slug = property.slug;
                await auction.save();
                console.log(`Updated auction ${auction._id} with slug ${property.slug}`);
            }
        }

        console.log('Migration complete');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
