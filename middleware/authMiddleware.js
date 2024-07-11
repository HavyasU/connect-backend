import JWT from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const authHeader = req?.headers?.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ success: "false", message: "Authentication failed" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const userToken = JWT.verify(token, process.env.JWT_SECRET_KEY);
    req.body.user = {
      userId: userToken.userId,
    };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      try {
        // Decode the token to get the payload without verifying
        const decodedToken = JWT.decode(token);

        // Generate a new token with the same payload
        const newToken = JWT.sign(
          { userId: decodedToken.userId },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1d" } // Adjust expiration time as needed
        );

        // Send the new token in the response
        res.status(200).json({ success: "new", newToken });
      } catch (newTokenError) {
        console.error(newTokenError);
        return res.status(500).json({ success: false, message: "Failed to create new token" });
      }
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    } else {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
};

export default userAuth;
