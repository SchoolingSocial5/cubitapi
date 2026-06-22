import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
    username: string;
    email: string;
    picture?: string;
    isVerified: boolean;
    address?: string;
    area?: string;
    state?: string;
    country?: string;
    dateOfBirth?: Date;
    idCard?: string;
    idName?: string;
    passport?: string;
    bio?: string;
    website?: string;
    role: 'user' | 'admin' | 'staff';
    accountType?: 'User' | 'Agent';
    phone?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    sex?: string;
    nextOfKinName?: string;
    nextOfKinRelation?: string;
    nextOfKinPhone?: string;
    password?: string;
    createdAt: Date;
    matchPassword: (password: string) => Promise<boolean>;
    getSignedJwtToken: () => string;
}

const userSchema: Schema = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    picture: {
        type: String,
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    address: String,
    area: String,
    state: String,
    country: String,
    dateOfBirth: Date,
    idCard: String,
    idName: String,
    passport: String,
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    website: String,
    role: {
        type: String,
        enum: ['user', 'admin', 'staff'],
        default: 'user'
    },
    accountType: {
        type: String,
        enum: ['User', 'Agent'],
        default: 'User'
    },
    phone: String,
    firstName: {
        type: String,
        default: ''
    },
    middleName: String,
    lastName: {
        type: String,
        default: ''
    },
    sex: String,
    nextOfKinName: String,
    nextOfKinRelation: String,
    nextOfKinPhone: String,
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password by default
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (this: IUser) {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
});

userSchema.methods.getSignedJwtToken = function (this: IUser) {
    return jwt.sign(
        { id: this._id.toString() },
        (process.env.JWT_SECRET || 'secret') as jwt.Secret,
        {
            expiresIn: (process.env.JWT_EXPIRE || '30d') as any
        }
    );
};

userSchema.methods.matchPassword = async function (this: IUser, enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password as string);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
