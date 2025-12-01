// Cookie utilities
export const cookies = {
  // Default cookie settings for security and expiration
  getOptions: () => ({
    httpOnly: true, // Cookie cannot be accessed by JavaScript (helps prevent XSS attacks)
    secure: process.env.NODE_ENV === 'production', // Cookie only sent over HTTPS in production
    sameSite: 'strict', // Prevents cookie from being sent with cross-site requests
    maxAge: 15 * 60 * 1000, // Cookie expires in 15 minutes
  }),

  // Set a cookie on the response
  set: (res, name, value, options = {}) => {
    // Merge default options with custom options
    res.cookie(name, value, { ...cookies.getOptions(), ...options });
  },

  // Clear/remove a cookie from the response
  clear: (res, name, options = {}) => {
    // Clear cookie using default and custom options
    res.clearCookie(name, { ...cookies.getOptions(), ...options });
  },

  // Get a cookie from the request
  get: (req, name) => {
    return req.cookies[name]; // Return cookie value
  },
};
