// TODO: create the following functions:
// - userGet - get user by id
// - userListGet - get all users
// - userPost - create new user. Remember to hash password
// - userPutCurrent - update current user
// - userDeleteCurrent - delete current user
// - checkToken - check if current user token is valid: return data from req.user. No need for database query
import {NextFunction, Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import CustomError from '../../classes/CustomError';
import {User, UserOutput, LoginUser} from '../../interfaces/User';
import userModel from '../models/userModel';
import {validationResult} from 'express-validator';

const userGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: UserOutput = (await userModel.findById(
      req.params.id
    )) as UserOutput;
    if (user) {
      res
        .status(200)
        .json({_id: user._id, user_name: user.user_name, email: user.email});
    }
  } catch (err) {
    next(err);
  }
};

const userListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userModel.find({});

    const usersOutput: UserOutput[] = users.map((user) => {
      return {
        _id: user._id,
        user_name: user.user_name,
        email: user.email,
      } as UserOutput;
    });
    res.status(200).json(usersOutput);
  } catch (err) {
    next(err);
  }
};

const userPost = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req.body as UserOutput);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('user_post validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const user: User = req.body as User;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(user.password!, salt);
    user.password = hash;
    const newUser: UserOutput = await userModel.create(user);
    if (newUser) {
      res.json({message: 'user added', data: newUser as UserOutput});
    }
  } catch (err) {
    next(err);
  }
};

const userPutCurrent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user: User = req.user as User;
  const body = req.body;
  const updateUser = await userModel.findByIdAndUpdate(user, {
    user_name: body.user_name,
    email: body.email,
  });
  if (updateUser) {
    const updatedUserOutput: UserOutput = {
      _id: user._id,
      user_name: body.user_name,
      email: body.email,
    };
    res.json({message: 'user updated', data: updatedUserOutput});
  } else {
    next(new CustomError('Unauthorized updating', 401));
  }
};

const userDeleteCurrent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user: User = req.user as User;
    const result: User = (await userModel.findByIdAndDelete(user._id)) as User;
    if (result) {
      const deletedUser: UserOutput = {
        _id: user._id,
        user_name: user.user_name,
        email: user.email,
      };
      res.json({message: 'user deleted', data: deletedUser});
    } else {
      next(new CustomError('Unauthorized deletion', 401));
    }
  } catch (err) {
    next(err);
  }
};

const checkToken = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as LoginUser;
  if (!user) {
    next(new CustomError('token not valid', 403));
    return;
  }
  const checkUser: UserOutput = {
    _id: user._id,
    user_name: user.user_name,
    email: user.email,
  } as UserOutput;
  res.json(checkUser);
};

const userController = {
  userGet,
  userListGet,
  userPost,
  userPutCurrent,
  userDeleteCurrent,
  checkToken,
};

export default userController;