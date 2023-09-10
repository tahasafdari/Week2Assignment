import mongoose from 'mongoose';
import {Cat} from '../../interfaces/Cat';

const catSchema = new mongoose.Schema<Cat>({
  cat_name: {
    type: String,
  },
  weight: {
    type: Number,
    required: true,
  },
  filename: {
    type: String,
  },
  birthdate: {
    type: Date,
    required: true,
  },
  location: {
    type: {type: String, enum: ['Point'], required: true},
    coordinates: [Number, Number],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const catModel = mongoose.model<Cat>('Cat', catSchema);

export default catModel;