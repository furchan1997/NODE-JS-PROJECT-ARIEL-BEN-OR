const express = require("express");
const router = express.Router();
const { User, validateUser } = require("../models/users");
const bcrypt = require("bcrypt");
const authMW = require("../middleware/auth");
const picker = require("../config/dataPicker");
const errors = require("../errors/usersErr");
const config = require("../config/config");
const { Card } = require("../models/cards");
const checkAuthorization = require("../middleware/checkAuth");
const { createToken } = require("../scripts/newToken");
const userFields = require("../data/userFields");
const user = require("../initialDate/userAdmin");

// כניסה לחשבון היוזר על ידיי מנהל או בעל החשבון באמצעות הטוקן
router.get("/:id", authMW, checkAuthorization, async (req, res, next) => {
  try {
    // בדיקת קיומו של יוזר
    const user = await User.findOne({ _id: req.params.id });

    if (!user) {
      return res
        .status(errors.USERS_NOT_FOUND.status)
        .json({ message: errors.USERS_NOT_FOUND.message });
    }

    res.json(picker(user, userFields));
  } catch (err) {
    next(err); // מעביר את השגיאה למידלוואר של טיפול בשגיאות
  }
});

// מחיקת משתמש קיים
router.delete("/:id", authMW, checkAuthorization, async (req, res, next) => {
  try {
    // מציאת יוזר ובדיקת קיומו
    const user = await User.findOneAndDelete({ _id: req.params.id });
    if (!user) {
      res
        .status(errors.USERS_NOT_FOUND.status)
        .json({ message: errors.USERS_NOT_FOUND.message });
      return;
    }

    // אם יוזר עיסקי נמחק אז נמחקים לו כל הכרטיסים (במידה ויש לו)
    await Card.deleteMany({ user_id: req.params.id });

    const response = {
      message: "User deleted.",
      ...picker(user, userFields),
    };

    res.json(response);
  } catch (err) {
    next(err); // מעביר את השגיאה למידלוואר של טיפול בשגיאות
  }
});

// עריכת פרטי משתמש קיים
router.put("/:id", authMW, async (req, res, next) => {
  try {
    // ולידציית ג'וי שמטפלת בסכמה הרלוונטית לבקשה
    const { error } = validateUser(req.body, "PUT");
    // בדיקה ולידציה של ג'וי
    if (error) {
      res.status(errors.BAD_REQUEST.status).json({
        message: errors.BAD_REQUEST.message,
        reason: error.details[0].message,
      });
      return;
    }

    // בדיקת הרשאות
    if (req.params.id !== req.user.id) {
      res
        .status(403)
        .send("Only the account owner has permission to change their details.");
      return;
    }

    // עידכון המשתמש
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        ...req.body,
      },
      {
        returnDocument: "after",
      }
    );

    if (!user) {
      res
        .status(errors.USERS_NOT_FOUND.status)
        .json({ message: errors.USERS_NOT_FOUND.message });
      return;
    }

    res.json(picker(user, userFields));
  } catch (err) {
    next(err); // מעביר את השגיאה למידלוואר של טיפול בשגיאות
  }
});

// עדכון סטטוס עיסקי
router.patch("/:id", authMW, async (req, res, next) => {
  try {
    // חיפוש משתמש לפי מזהה
    const user = await User.findById(req.params.id);
    // בדיקת משתמש קיים
    if (!user) {
      res
        .status(errors.USERS_NOT_FOUND.status)
        .send(errors.USERS_NOT_FOUND.message);
      return;
    }
    // בדיקת הרשאות
    if (req.user.id !== req.params.id) {
      res
        .status(errors.FORBIDDEN_USER.status)
        .send(errors.FORBIDDEN_USER.message);
      return;
    }

    user.isBusiness = !user.isBusiness; // משנה את הסטטוס
    await user.save(); // שומר את השינויים במסד הנתונים
    // טוקן חדש
    const token = createToken({
      id: user._id,
      biz: user.isBusiness,
      admin: user.isAdmin,
      key: config.jwtkey,
    });
    // התגובה ללקוח
    const response = {
      ...picker(user, userFields),
      message: "User status updated successfully. Please log in again.",
      token,
    };

    res.json(response);
  } catch (err) {
    next(err); // מעביר את השגיאה למידלוואר של טיפול בשגיאות
  }
});

// יצירת משתמש חדש ושמירתו בדאטא בייס
router.post("/", async (req, res, next) => {
  try {
    // ולידציית ג'וי שמטפלת בסכמה הרלוונטית לבקשה
    const { error } = validateUser(req.body, "POST");
    // VALIDATE INPUT
    if (error) {
      res.status(errors.BAD_REQUEST.status).json({
        message: errors.BAD_REQUEST.message,
        reason: error.details[0].message,
      });
      return;
    }

    // VALIDATE SYSTEM
    // בדיקה אם אימייל קיים במערכת
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      res.status(errors.BAD_REQUEST.status).send({ message: "Email is busy." });
      return;
    }

    // האשינג לסיסמא
    const userPassword = await bcrypt.hash(req.body.password, 12);
    // יצירת יוזר חדש ושמירתו בביס הנתונים
    user = await new User({
      ...req.body,
      url:
        req.body.image.url ??
        "https://mitmachim.top/assets/uploads/files/1617890002090-024a6e13-918d-4a6a-b67e-f8254a5ff97b-image.png",
      password: userPassword,
      isAdmin: req.body.isAdmin || false,
    });
    await user.save();

    // RESPONSE
    res.json(picker(user, userFields));
  } catch (err) {
    next(err); // מעביר את השגיאה למידלוואר של טיפול בשגיאות
  }
});

// קבלת כל היוזרים
router.get("/", authMW, async (req, res, next) => {
  try {
    // שאילתא עבור שליפת כל המשתמשים
    const users = await User.find({}, {});

    if (!users) {
      res.status(errors.USERS_NOT_FOUND.status).json({
        message: errors.USERS_NOT_FOUND.message,
      });
      return;
    }

    // בדיקת הרשאות
    if (req.user.admin !== true) {
      res
        .status(403)
        .send("This user does not have permission to receive all users.");
      return;
    }

    res.json(picker(users, userFields));
  } catch (err) {
    next(err); // מעביר את השגיאה למידלוואר של טיפול בשגיאות
  }
});

// מחיקת יוזרים ואיפוס המערכת לצורך נוחות
router.delete("/", authMW, async (req, res, next) => {
  try {
    // בדיקת הרשאות
    if (!req.user.admin) {
      res.status(403).send("Only admin");
      return;
    }

    // מחיקת יוזרים
    await User.deleteMany({}, {});

    // מחיקת כרטיסים
    await Card.deleteMany({}, {});

    res.send("deleted");
  } catch (err) {
    next(err); // מעביר את השגיאה למידלוואר של טיפול בשגיאות
  }
});

module.exports = router;
