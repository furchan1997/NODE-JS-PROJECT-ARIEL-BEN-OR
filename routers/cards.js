const express = require("express");
const router = express.Router();
const { Card, validateCard, generateBizNumber } = require("../models/cards");
const authMW = require("../middleware/auth");
const { User } = require("../models/users");
const bizAuthMW = require("../middleware/bizAuth");
const picker = require("../config/dataPicker");
const cardFields = require("../data/cardFields");
const errors = require("../errors/cardsErr");
const userErrors = require("../errors/usersErr");

// יצירת כרטיס חדש
router.post("/", authMW, bizAuthMW, async (req, res) => {
  const { error } = validateCard(req.body);
  // VALIDATE  CARD INPUT
  if (error) {
    res.status(errors.BAD_REQUEST.status).json({
      Status: errors.BAD_REQUEST.status,
      Message: errors.BAD_REQUEST.message,
      Reason: error.details[0].message,
    });
    return;
  }
  // בדיקת קיום יוזר לפני יצירת כרטיס
  const user = await User.findOne({ _id: req.user.id });
  if (!user) {
    res
      .status(userErrors.USERS_NOT_FOUND.status)
      .send(userErrors.USERS_NOT_FOUND.message);
    return;
  }
  // בדיקת הרשאות
  if (user.isBusiness !== true) {
    res
      .status(errors.FORBIDDEN_USER.status)
      .send(errors.FORBIDDEN_USER.message);
    return;
  }

  const card = await new Card({
    // יצירת כרטיס חדש, עם גוף הבקשה
    ...req.body,
    url:
      req.body.image.url ??
      "https://mitmachim.top/assets/uploads/files/1617890002090-024a6e13-918d-4a6a-b67e-f8254a5ff97b-image.png",
    // התאמת ההקשר בין היוזר לכרטיס שלו
    user_id: req.user.id,
    // הפעלת פונקציה למתן מספר עסק רנדומלי
    bizNumber: await generateBizNumber(),
  }).save();
  res.json(picker(card, cardFields));
});

// קבלת כרטיסים של המשתמש
router.get("/my-cards", authMW, async (req, res) => {
  const cards = await Card.find({ user_id: req.user.id });

  // בדיקה האם המשתמש הוא עיסקי
  if (req.user.biz !== true) {
    res
      .status(errors.FORBIDDEN_USER.status)
      .send(errors.FORBIDDEN_USER.message);
    return;
  }

  // בדיקה האם יש כרטיסים
  if (cards.length === 0) {
    res.status(404).send("No card yet.");
    return;
  }
  res.json(picker(cards, cardFields));
});

// קבלת כרטיס לפי המזהה שלו
router.get("/:id", async (req, res) => {
  // בדיקה האם כרטיס קיים
  const card = await Card.findOne({ _id: req.params.id });
  if (!card) {
    res
      .status(errors.CARD_NOT_FOUND.status)
      .send(errors.CARD_NOT_FOUND.message);
    return;
  }

  res.json(picker(card, cardFields));
});
// עדכון מספר עסק של כרטיס באמצעות מנהל בלבד
router.patch("/admin/:id", authMW, async (req, res) => {
  // ולידציה של ג'וי עבור עדכון כרטיס על ידיי מנהל בלבד
  const { error } = validateCard(req.body, true);

  if (error) {
    res.status(errors.BAD_REQUEST.status).json({
      Status: errors.BAD_REQUEST.status,
      Message: errors.BAD_REQUEST.message,
      Reason: error.details[0].message,
    });
    return;
  }
  // בדיקת הרשאות
  if (!req.user.admin) {
    res
      .status(errors.UNAUTHORIZED_FOR_NOT_ADMIN.status)
      .send(errors.UNAUTHORIZED_FOR_NOT_ADMIN.message);
    return;
  }
  // בדיקת נוכחות כרטיס בבסיס נתונים
  const card = await Card.findById(req.params.id);
  if (!card) {
    res
      .status(errors.CARD_NOT_FOUND.status)
      .send(errors.CARD_NOT_FOUND.message);
    return;
  }
  // שאילתא עבור הוצאת מסמך של כל מספרי העסק הקיימים
  const bizNumberCards = await Card.find({}, "bizNumber");
  // מיפוי של כרטיסי העסק ובדיקה האם כרטיס תפוס
  const bizNumbers = bizNumberCards.map((card) => card.bizNumber);
  if (bizNumbers.includes(req.body.bizNumber)) {
    res.status(400).send("This biz number is already taken.");
    return;
  }
  // עדכון מספר עסק עבור כרטיס
  let updatedCard = await Card.findOneAndUpdate(
    {
      _id: req.params.id,
    },
    { bizNumber: req.body.bizNumber },
    { returnDocument: "after" }
  );
  // הוספת השדה וערכו לאחר שינוי כתגובה אל צד הלקוח
  const response = [...cardFields, "bizNumber"];
  res.json(picker(updatedCard, response));
});

// עריכת כרטיס קיים לפי המזהה
router.put("/:id", authMW, async (req, res) => {
  try {
    // מציאת הכרטיס לפי ID
    const card = await Card.findById(req.params.id);
    if (!card) {
      res
        .status(errors.CARD_NOT_FOUND.status)
        .send(errors.CARD_NOT_FOUND.message);
      return;
    }

    // בדיקה אם המשתמש המחובר הוא בעל הכרטיס
    if (card.user_id.toString() !== req.user.id) {
      res.status(403).send("You are not authorized to edit this card.");
      return;
    }

    // בדיקה אם המשתמש מנסה לערוך שדות שאסור לו
    if (req.body.bizNumber) {
      res.status(errors.BAD_REQUEST.status).send(errors.BAD_REQUEST.message);
      return;
    }
    // עדכון הכרטיס
    const updatedCard = await Card.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    // בדיקה אם כרטיס לא קיים
    if (!updatedCard) {
      res
        .status(errors.CARD_NOT_FOUND.status)
        .send(errors.CARD_NOT_FOUND.message);
      return;
    }
    res.json(picker(updatedCard, cardFields));
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Internal Server Error.");
  }
});

// מחיקת כרטיס לפי המזהה
router.delete("/:id", authMW, async (req, res) => {
  // אם המשתמש הוא אדמין, הוא יכול למחוק כל כרטיס
  if (req.user.admin) {
    const card = await Card.findOne({ _id: req.params.id });

    if (!card) {
      return res
        .status(errors.CARD_NOT_FOUND.status)
        .send(errors.CARD_NOT_FOUND.message);
    }

    await Card.findByIdAndDelete(req.params.id);

    return res.json({
      message: "Card deleted by admin.",
      ...picker(card, cardFields),
    });
  }

  // אם המשתמש רגיל, הוא יכול למחוק רק את הכרטיסים שלו
  const card = await Card.findOne({ _id: req.params.id });

  if (!card) {
    return res
      .status(errors.CARD_NOT_FOUND.status)
      .send(errors.CARD_NOT_FOUND.message);
  }

  // אם הכרטיס לא שייך למשתמש הנוכחי, תחזור עם שגיאה 403
  if (card.user_id.toString() !== req.user.id) {
    return res
      .status(errors.UNAUTHORIZED_FOR_USER.status)
      .send(errors.UNAUTHORIZED_FOR_USER.message);
  }

  await Card.findByIdAndDelete(req.params.id);

  return res.json({
    message: "Card deleted by the user.",
    ...picker(card, cardFields),
  });
});

// לייק עבור כרטיס קיים במערכת לפי המזהה שלו
router.patch("/:id", authMW, async (req, res) => {
  // בדיקת קיומו של כרטיס
  const card = await Card.findById(req.params.id);
  if (!card) {
    res
      .status(errors.CARD_NOT_FOUND.status)
      .send(errors.CARD_NOT_FOUND.message);
    return;
  }
  // בדיקת קיום המשתמש במערכת
  const user = await User.findById(req.user.id);
  if (!user) {
    res
      .status(userErrors.USERS_NOT_FOUND.status)
      .send(userErrors.USERS_NOT_FOUND.message);
    return;
  }

  // בדיקה האם המזהה של המשתמש קיים במערך הלייקים של אותו כרטיס
  if (card.likes.includes(req.user.id)) {
    card.likes = card.likes.filter((like) => like !== req.user.id);
    // שמירת הנתונים החדשים
    await card.save();

    const responseForRemovingLike = [...cardFields, "likes"];
    res.json(picker(card, responseForRemovingLike));
    return;
  }
  // הוספת המזהה של המשתמש אל מערך הלייקים של הכרטיס ושמירה
  card.likes.push(req.user.id);
  await card.save();

  const responseForAddingLike = [...cardFields, "likes"];

  res.json(picker(card, responseForAddingLike));
});

// קבלת כל הכרטיסים
router.get("/", async (req, res) => {
  // בדיקה האם כרטיסים קיימים בבסיס נתונים
  const cards = await Card.find({}, {});
  if (cards.length === 0) {
    res.status(404).send("No cards yet.");
    return;
  }
  res.json(picker(cards, cardFields));
});

module.exports = router;
