module.exports = {
  CARD_NOT_FOUND: {
    status: 404,
    message: "Card not found.",
  },

  BAD_REQUEST: {
    status: 400,
    message: "Bad request. Please check your input.",
  },
  FORBIDDEN_USER: {
    status: 403,
    message: "You must be a user biz.",
  },
  UNAUTHORIZED_FOR_NOT_ADMIN: {
    status: 403,
    message: "Only an administrator can perform this action.",
  },
  UNAUTHORIZED_FOR_USER: {
    status: 403,
    message: "Only an Cardholder can perform this action.",
  },
};
