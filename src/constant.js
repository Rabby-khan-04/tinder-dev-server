const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000,
  signed: true,
};

const USER_SAFE_DATA = "photo skills bio firstName lastName gender age";

module.exports = { cookieOptions, USER_SAFE_DATA };
