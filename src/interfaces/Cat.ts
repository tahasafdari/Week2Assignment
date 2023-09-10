import {Point} from 'geojson';

interface Cat {
  _id: any;
  cat_name: string;
  weight: number;
  filename: string;
  birthdate: Date;
  location: {
    type: Point;
    coordinates: number[];
  };
  owner: {
    _id: number;
    user_name: string;
    email: string;
  };
}

interface GetCat extends Partial<Cat> {
  cat_name: string;
  weight: number;
  birthdate: Date;
  location: {
    type: Point;
    coordinates: number[];
  };
  owner: {
    _id: number;
    user_name: string;
    email: string;
  };
}

interface PostCat extends Partial<Cat> {
  cat_name: string;
  weight: number;
  filename: string;
  birthdate: Date;
  location: {
    type: Point;
    coordinates: number[];
  };
  owner: {
    _id: number;
    user_name: string;
    email: string;
  };
}

interface PutCat extends Partial<Cat> {
  cat_name?: string;
  weight?: number;
  filename?: string;
  birthdate?: Date;
  location?: {
    type: Point;
    coordinates: number[];
  };
  owner?: {
    _id: number;
    user_name: string;
    email: string;
  };
}

export {Cat, PostCat, PutCat, GetCat};