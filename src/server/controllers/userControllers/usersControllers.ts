import "../../../loadEnvironments.js";
import { type NextFunction, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { type UserCredentials } from "../../types.js";
import User from "../../../database/models/User.js";
import { CustomError } from "../../../CustomError/CustomError.js";
import { type CustomJwtPayload } from "./types.js";

export const loginUser = async (
  req: Request<
    Record<string, unknown>,
    Record<string, unknown>,
    UserCredentials
  >,
  res: Response,
  next: NextFunction
) => {
  const { password, email } = req.body;

  try {
    const user = await User.findOne({ email }).exec();

    if (!user) {
      const error = new CustomError(
        "No user with this email",
        401,
        "Wrong credentials"
      );

      next(error);

      return;
    }

    if (!(await bcrypt.compare(password, user.password))) {
      const error = new CustomError("Wrong password", 401, "Wrong credentials");

      next(error);

      return;
    }

    const jwtPayload: CustomJwtPayload = {
      email: user.email,
      id: user._id.toString(),
    };

    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET!);

    res.status(200).json({ token });
  } catch (error: unknown) {
    next(error);
  }
};
