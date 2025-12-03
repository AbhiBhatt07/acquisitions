import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
import { formatValidationError } from '#utils/format.js';
import { signUpSchema, signInSchema } from '#validations/auth.validation.js';
import { createUser, authenticateUser } from '#services/auth.service.js';
import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signUpSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.log(validationResult.error.issues);

      return res.status(400).json({
        error: 'Validation failed!',
        details: formatValidationError(validationResult.error),
      });
    }

    const { name, email, role, password } = validationResult.data;

    const user = await createUser({ name, email, password, role });

    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      roles: user.role,
    });

    cookies.set(res, 'token', token);

    logger.info(`user registered successfully: ${email}`);
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    logger.error('Signup Error', e);

    if (e.message === 'With this email user already exists') {
      return res.status(409).json({ message: 'Email already exists' });
    }

    next(e);
  }
};

export const signin = async (req, res, next) => {
  try {
    const validationResult = signInSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.log(validationResult.error.issues);

      return res.status(400).json({
        error: 'Validation failed!',
        details: formatValidationError(validationResult.error),
      });
    }

    const { email, password } = validationResult.data;

    const user = await authenticateUser({ email, password });

    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      roles: user.role,
    });

    cookies.set(res, 'token', token);

    logger.info(`user signed in successfully: ${email}`);
    res.status(200).json({
      message: 'User signed in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    logger.error('Signin Error', e);

    if (e.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }

    if (e.message === 'Invalid password') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    next(e);
  }
};

export const signout = async (req, res, next) => {
  try {
    cookies.clear(res, 'token');

    logger.info('user signed out successfully');
    res.status(200).json({
      message: 'User signed out successfully',
    });
  } catch (e) {
    logger.error('Signout Error', e);
    next(e);
  }
};
