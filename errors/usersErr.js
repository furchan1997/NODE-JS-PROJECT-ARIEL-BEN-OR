// אובייקט שגיאות סטנדרטיות עם ההודעה והסטטוס למען נוחות וסדר בקוד
module.exports = {
  USERS_NOT_FOUND: {
    status: 404,
    message: "User not found.",
  },

  INVALID_TOKEN: {
    status: 401,
    message: "Access denied. Token is required.",
  },
  FORBIDDEN: {
    status: 403,
    message: "Access denied. Admins or account owners only.",
  },
  FORBIDDEN_USER: {
    status: 403,
    message: "Access denied. account owner only.",
  },
  SERVER_ERROR: {
    status: 500,
    message: "Something went wrong.",
  },
  BAD_REQUEST: {
    status: 400,
    message: "Bad request. Please check your input.",
  },
};
