const options = {
  httpOnly: true, // makes the cookie non-modifiable by the client-side
  secure: process.env.NODE_ENV === "production",
};

export { options };
