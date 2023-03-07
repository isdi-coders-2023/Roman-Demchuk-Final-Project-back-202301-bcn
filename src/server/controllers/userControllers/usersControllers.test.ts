import { type Response, type Request } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../../../database/models/User.js";
import { type UserCredentials } from "../../types.js";
import { loginUser } from "./usersControllers.js";
import { CustomError } from "../../../CustomError/CustomError.js";

beforeEach(() => {
  jest.clearAllMocks();
});

const req = {} as Request<
  Record<string, unknown>,
  Record<string, unknown>,
  UserCredentials
>;
const res: Partial<Response> = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};
const next = jest.fn();

describe("Given a loginUser controller", () => {
  const mockUser: UserCredentials = {
    email: "didi@test.com",
    password: "didi1234",
  };
  describe("When it receives a request with email 'didi@test.com' and password 'didi1234' and the user exists in the database", () => {
    test("Then it should call its status method with code 200", async () => {
      req.body = mockUser;
      const expectedStatusCode = 200;

      User.findOne = jest.fn().mockImplementationOnce(() => ({
        exec: jest.fn().mockResolvedValue({
          ...mockUser,
          _id: new mongoose.Types.ObjectId(),
        }),
      }));
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      await loginUser(req, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(expectedStatusCode);
    });
  });

  describe("When it receives a request with email 'd0d0@test.com' and password 'd0d01234' and the user does not exist in the database", () => {
    test("Then it should call its status method with code  401", async () => {
      req.body = mockUser;
      const expectedError = new CustomError(
        "No user with this email",
        401,
        "Wrong credentials"
      );

      User.findOne = jest.fn().mockImplementationOnce(() => ({
        exec: jest.fn().mockResolvedValue(undefined),
      }));
      await loginUser(req, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});
