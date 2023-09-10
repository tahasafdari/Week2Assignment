import express from 'express';
import controller from '../controllers/userController';
import passport from '../../passport';
import {body} from 'express-validator';

const router = express.Router();

// TODO: add validation

const userValidation = [
  body('_id', 'Id is required').exists(),
  body('user_name', 'User name is required').exists(),
  body('email', 'Email is required').exists(),
];

router
  .route('/')
  .get(controller.userListGet)
  .post(userValidation, controller.userPost)
  .put(
    passport.authenticate('jwt', {session: false}),
    controller.userPutCurrent
  )
  .delete(
    passport.authenticate('jwt', {session: false}),
    controller.userDeleteCurrent
  );

router.get(
  '/token',
  passport.authenticate('jwt', {session: false}),
  controller.checkToken
);

router.route('/:id').get(controller.userGet);

export default router;
