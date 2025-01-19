const config = require("../config/config");
const joi = require("joi");
const express = require("express");
const router = express.Router();
const { createToken } = require("../scripts/newToken");
const bcrypt = require("bcrypt");
const { User } = require("../models/users");
const errors = require("../errors/usersErr");

// יצירת טוקן עבור כניסה של היוזר לחשבון שלו
router.post("/login", async (req, res, next) => {
  try {
    const { error } = validateUserExists(req.body);
    // VALIDATE  USER INPUT
    if (error) {
      res.status(errors.BAD_REQUEST.status).json({
        message: errors.BAD_REQUEST.message,
        reason: error.details[0].message,
      });
      return;
    }
    //   VALIDATE SYSTEM
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(errors.BAD_REQUEST.status).json({
        message: errors.BAD_REQUEST.message,
      });
      return;
    }
    // לבדוק אם הסיסמה שהוזנה תואמת לסיסמה שהוצפנה ושמורה
    const validatePassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    // בדיקת סיסמא מול הלקוח
    if (!validatePassword) {
      res.status(errors.BAD_REQUEST.status).json({
        message: errors.BAD_REQUEST.message,
      });
      return;
    }
    // יצירת טוקן חדש
    const token = createToken({
      id: user._id,
      biz: user.isBusiness,
      admin: user.isAdmin,
      key: config.jwtkey,
    });

    res.send({ token, id: user._id });
  } catch (err) {
    next(err);
  }
});

// ולידציית ג'וי לשם התחברות משתמש למערכת
function validateUserExists(user) {
  const schema = joi.object({
    email: joi.string().min(9).email().required(),
    password: joi.string().min(7).required(),
  });

  return schema.validate(user);
}

module.exports = router;
