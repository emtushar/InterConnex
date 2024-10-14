import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const createAccessAndRefreshTokens = async function (userId) {
  // get user from userid
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "Invalid credentials");
  }
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  user.refreshToken = refreshToken;
  user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from body
  // check all fields are non empty
  // check if user exists or not
  // get avatar from multer
  // upload avatar on cloudinary
  // create user
  // check if user is created
  // give error if user is not created
  // return created user
  console.log(req.body);
  const { fullName, email, username, password, mobile } = req.body;

  if (
    [email, username, fullName, password, mobile].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All Fields are required");
  }

  const existedUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existedUser) {
    throw new ApiError(400, "User already exists with this email");
  }
  console.log(req.file);
  const avatarLocalPath = req.file?.path;
  // const avatarLocalPath = req.file?.path;

  console.log(avatarLocalPath);
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required");
  }
  const avatarUrl = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarUrl.url) {
    throw new ApiError(500, "Failed to upload avatar file");
  }
  console.log(avatarUrl);
  const createdUser = await User.create({
    email,
    fullName,
    mobile,
    username,
    password,
    avatar: avatarUrl.url,
  });

  const user = await User.findById(createdUser._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(500, "Failed to register User");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // get email or username and password from body
  // check for nonempty
  // find user
  // not found error
  // check userpassword
  // create tokens
  // response send token in cookies and
  const { email, username, password } = req.body;
  if (!email && !username && !password) {
    throw new ApiError(400, "Fields can't be empty");
  }
  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) {
    throw new ApiError(400, "Can't find user with this username or email");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid Credentials");
  }
  // create access and refresh token
  const { accessToken, refreshToken } = await createAccessAndRefreshTokens(
    user._id
  );
  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None", // Add this line
  };
  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        { loggedUser, accessToken, refreshToken },
        "Logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // get user from auth
  // expire its refreshtoken
  // clear cookies

  await User.findByIdAndUpdate(req.user?._id, { $unset: { refreshToken: 1 } });
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(201)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(201, {}, "User Logged out successfully"));
});

const changeUserAvatar = asyncHandler(async (req, res) => {
  // get user from auth
  // get avatar file from reqfile
  // check for avatar non empty
  // hold old avatar in variable
  // upload avatar on cloudinary
  // check for successfull uploading
  // update avatar file
  // delete old avatar
  // return updated user
  const avatarLocalFilePath = req.file?.path;

  if (!avatarLocalFilePath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalFilePath);
  if (!avatar?.url) {
    throw new ApiError(500, "Error while uploading the avatar file");
  }
  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password -refreshToken");

  if (!updatedUser) {
    throw new ApiError(500, "Failed to update avatar");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, updatedUser, "Avatar changed successfully"));
});

const changeUserPassword = asyncHandler(async (req, res) => {
  // check auth
  // get old and new password from body
  // check password for non empty
  // match old password with dbpassword using is password correct
  // if matched
  // change dbpassword to new password
  // return response password updated
  const { oldPassword, newPassword } = req.body;
  if ([oldPassword, newPassword].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  if (oldPassword === newPassword) {
    throw new ApiError(400, "new password cannot be same as old password");
  }
  const user = await User.findById(req.user?._id);
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(400, "Incorrect old  password ");
  }
  user.password = newPassword;
  user.save({ validateBeforeSave: false });

  return res
    .status(201)
    .json(new ApiResponse(201, {}, "User's password updated successfully"));
});

const changeUserDetails = asyncHandler(async (req, res) => {
  // change email,name,mobile
  // get data from body
  // check for non empty
  // find user and update
  // check for updation
  // return updated user
  const { email, fullName, mobile } = req.body;

  if ([email, fullName, mobile].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All Fields are required");
  }
  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        email,
        fullName,
        mobile,
      },
    },
    { new: true }
  );
  if (!updatedUser) {
    throw new ApiError(500, "Failed to update user's detail");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, updatedUser, "User details updated successfully")
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // refreshtoken
  // get user refresh token from cookie
  // check if it exists
  // find user from auth
  // if exists then get db refresh token
  // match user refresh token with db refresh token
  // if matched
  // generate refresh and access token
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }
  // const user = await User.findById(req.user?._id);
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET_KEY
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(400, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(400, "Token is either expired or old");
    }
    const { accessToken, newRefreshToken } = await createAccessAndRefreshTokens(
      user._id
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          201,
          { accessToken: accessToken, refreshToken: newRefreshToken },
          "access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(400, error?.message || "Invalid Token");
  }
});
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User Fetched successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
  // get user from params
  // find user by id
  // res user with followers and followings
  const { username } = req.params;
  const user = await User.findOne({ username }).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(400, "Invalid username");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, user, "User's Profile fetched successfully"));
});

const toggleFollowUser = asyncHandler(async (req, res) => {
  // get user to follow id throught params
  // get user who wants to follow through auth
  // check if user to follow is valid
  // check if user to follow is present in follower of current user
  // if present then remove
  // if not then add
  // return updated userin response
  const userToBeFollowedId = req.params.id;
  const currentUserId = req.user?.id;

  // const userToBeFollwed = await User.findById(userToBeFollowedId);
  // const currentUser = await User.findById(currentUserId);

  // if (!currentUser.followers.includes(userToBeFollowedId)) {
  //   currentUser.followers.push(userToBeFollowedId);
  //   userToBeFollwed.followings.push(currentUserId);
  // }
  console.log(currentUserId);
  const follower = await User.findOne({
    _id: currentUserId,
    followings: { $in: [userToBeFollowedId] },
  });
  if (!follower) {
    // currentUser.followers.push(userToBeFollowedId);
    // userToBeFollwed.followings.push(currentUserId);
    await User.updateOne(
      { _id: userToBeFollowedId },
      { $push: { followers: currentUserId } }
    );
    await User.updateOne(
      { _id: currentUserId },
      { $push: { followings: userToBeFollowedId } }
    );

    return res
      .status(201)
      .json(new ApiResponse(201, {}, "Followed Account Successfully"));
  }
  if (follower) {
    // currentUser.followers.pull(userToBeFollowedId);
    // userToBeFollwed.followings.pull(currentUserId);
    await User.updateOne(
      { _id: userToBeFollowedId },
      { $pull: { followers: currentUserId } }
    );
    await User.updateOne(
      { _id: currentUserId },
      { $pull: { followings: userToBeFollowedId } }
    );

    return res
      .status(201)
      .json(new ApiResponse(201, {}, "Unfollowed Account Successfully"));
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  changeUserAvatar,
  changeUserPassword,
  changeUserDetails,
  refreshAccessToken,
  getCurrentUser,
  getUserProfile,
  toggleFollowUser,
};
