// TODO: create following functions:
// - catGetByUser - get all cats by current user id
// - catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
// - catPutAdmin - only admin can change cat owner
// - catDeleteAdmin - only admin can delete cat
// - catDelete - only owner can delete cat
// - catPut - only owner can update cat
// - catGet - get cat by id
// - catListGet - get all cats
// - catPost - create new cat


import {NextFunction, Request, Response} from 'express';
import {PostCat, Cat, PutCat, GetCat} from '../../interfaces/Cat';
import catModel from '../models/catModel';
import {LoginUser, UserOutput} from '../../interfaces/User';
import CustomError from '../../classes/CustomError';
import {validationResult} from 'express-validator';

const catGetByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as UserOutput;
  const cats = await catModel.find({owner: user._id});
  if (cats) {
    res.json(cats);
  } else {
    next(new CustomError('Cat not found', 404));
  }
};

const catGetByBoundingBox = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const coordinates = [req.query.topRight, req.query.bottomLeft] as [
    string,
    string
  ];

  const {lat1, lon1, lat2, lon2} = {
    lon1: parseFloat(coordinates[0].split(',')[0]),
    lat1: parseFloat(coordinates[0].split(',')[1]),
    lon2: parseFloat(coordinates[1].split(',')[0]),
    lat2: parseFloat(coordinates[1].split(',')[1]),
  };

  const cats = await catModel.find({
    location: {
      $geoWithin: {
        $geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [lat1, lon1],
              [lat2, lon1],
              [lat2, lon2],
              [lat1, lon2],
              [lat1, lon1],
            ],
          ],
        },
      },
    },
  });
  if (cats) {
    res.json(cats);
  } else {
    next(new CustomError('Cat not found', 404));
  }
};

const catPutAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const admin = req.user as LoginUser;
  const catId = req.params.id;
  const cat = req.body as Cat;
  if (admin) {
    const catOutput: PutCat = {
      cat_name: cat.cat_name,
      weight: cat.weight,
      filename: cat.filename,
      birthdate: cat.birthdate,
      location: cat.location,
    };

    await catModel.findByIdAndUpdate(catId, catOutput);

    res.json({message: 'cat updated', data: catOutput});
  } else {
    next(new CustomError('Unauthorized', 401));
  }
};

const catDeleteAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const catId = req.params.id;
  const deletedCat = await catModel.findByIdAndDelete(catId);
  if (deletedCat) {
    res.json({message: 'cat deleted by admin', data: deletedCat});
  } else {
    next(new CustomError('Cat not deleted', 400));
  }
};

const catDelete = async (req: Request, res: Response, next: NextFunction) => {
  const user: LoginUser = req.user as LoginUser;
  const catId = req.params.id;
  const deletedCat = await catModel.findByIdAndDelete(catId);
  if (deletedCat?.owner.toString() === user._id) {
    res.json({message: 'cat deleted', data: deletedCat});
  } else {
    next(new CustomError('Unauthorized', 401));
  }
};

const catPut = async (req: Request, res: Response, next: NextFunction) => {
  const owner = req.user as UserOutput;
  const catId = req.params.id;
  const cat = req.body as Cat;
  if (owner) {
    const catOwner: UserOutput = {
      _id: owner._id,
      user_name: owner.user_name,
      email: owner.email,
    };

    const catOutput: PutCat = {
      cat_name: cat.cat_name,
      weight: cat.weight,
      filename: cat.filename,
      birthdate: cat.birthdate,
      location: cat.location,
      owner: catOwner,
    };

    await catModel.findByIdAndUpdate(catId, catOutput);

    res.json({message: 'cat updated', data: catOutput});
  } else {
    next(new CustomError('Unauthorized', 401));
  }
};

const catGet = async (req: Request, res: Response, next: NextFunction) => {
  const catId = req.params.id;
  if (!catId) {
    next(new CustomError('Cat not found', 404));
    return;
  }

  const cat = await catModel.findById(catId);
  if (!cat) {
    new CustomError('Cat owner not found', 404);
    return;
  }

  const owner: UserOutput = {
    _id: cat.owner._id,
    user_name: cat.owner.user_name,
    email: cat.owner.email,
  };

  const catOutput: GetCat = {
    _id: cat._id,
    cat_name: cat.cat_name,
    weight: cat.weight,
    birthdate: cat.birthdate,
    location: cat.location,
    owner: owner,
  };
  res.status(200).json(catOutput);
};

const catListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cats = await catModel.find({});
    const catOutput: GetCat[] = cats.map((cat) => {
      const owner: UserOutput = {
        _id: cat.owner._id,
        user_name: cat.owner.user_name,
        email: cat.owner.email,
      };
      if (owner._id) {
        return {
          _id: cat._id as string,
          cat_name: cat.cat_name,
          weight: cat.weight,
          birthdate: cat.birthdate,
          location: cat.location,
          owner: owner,
        };
      } else {
        new CustomError('Cat owner not found', 404);
      }
    }) as GetCat[];

    res.status(200).json(catOutput);
  } catch (err) {
    next(err);
  }
};

const catPost = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req.body);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_post validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  const owner = req.user as UserOutput;
  const cat = req.body;
  if (owner) {
    const catOwner: UserOutput = {
      _id: owner._id,
      user_name: owner.user_name,
      email: owner.email,
    };

    const filename = req.file?.filename;

    const location = res.locals.coords;

    const newCat = await catModel.create({
      weight: cat.weight,
      birthdate: cat.birthdate,
      filename: filename,
      location: location,
      owner: catOwner,
      cat_name: cat.cat_name,
    });
    res.json({message: 'cat added', data: newCat as Cat});
  } else {
    next(new CustomError('Unauthorized', 401));
  }
};

export {
  catGetByUser,
  catGetByBoundingBox,
  catPutAdmin,
  catDeleteAdmin,
  catDelete,
  catPut,
  catGet,
  catListGet,
  catPost,
};