import mongoose from 'mongoose';
import {User} from '../../interfaces/User';

const userSchema = new mongoose.Schema<User>({
  user_name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {type: String},
  password: {type: String, required: true},
});

userSchema.set('toJSON', {
  transform: (doc, user) => {
    user.id = user._id;
    delete user._id;
    delete user.__v;
    delete user.password;
    delete doc.password;
  },
});

const userModel = mongoose.model<User>('User', userSchema);

export default userModel;