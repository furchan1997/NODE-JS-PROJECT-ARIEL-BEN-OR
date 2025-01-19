// מידלוואר עבור בדיקת משתמש אם הוא עסקי בכדי להחזיר שגיאה אם שינה את הסטטוס העיסקי שלו מקודם לכן
const errors = require("../errors/cardsErr");
module.exports = (req, res, next) => {
  if (!req.user.biz) {
    res
      .status(errors.FORBIDDEN_USER.status)
      .send(errors.FORBIDDEN_USER.message);
    return;
  }
  next();
};
