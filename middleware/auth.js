const jwt = require("jsonwebtoken");
const config = require("../config/config");
const errors = require("../errors/usersErr");
// מידלוואר עבור אימות  המשתמש או להחזיר שגיאה אם הטוקן לא תקין.
module.exports = (req, res, next) => {
  //  הגדרת שם הטוקן בהידר + בדיקה
  const token = req.header("x-auth-token");
  if (!token) {
    res.status(errors.INVALID_TOKEN.status).json({
      message: errors.INVALID_TOKEN.message,
    });
    return;
  }
  try {
    // אימות הטוקן
    const payload = jwt.verify(token, config.jwtkey);
    req.user = payload;
    // אם הכל בסדר , טוקן קיים, נכון אפשר להמשיך הלאה בקוד
    next();
  } catch (error) {
    res.status(errors.BAD_REQUEST.status).json({
      message: errors.BAD_REQUEST.message,
    });
  }
};
