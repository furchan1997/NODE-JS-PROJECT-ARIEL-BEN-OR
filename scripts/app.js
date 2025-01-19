// ייבוא של המודולים והסיפריות הרלוונטיות

require("dotenv").config();

// עבור שימוש במותדת החיבור אשר תחבר אותי לשרת מונגו
const mongoose = require("mongoose");
const cors = require("cors");
const bcryp = require("bcrypt");
//עבור שימוש בפעולות ליצירת שרת ו
const express = require("express");
const app = express();

require("../scripts/createAdmin");
// ייבוא של יוזרים וכרטיסים פיקטיביים לצורך הזרקת מידע ראשוני
const { initialUsers } = require("../initialDate/users.js");
const { initialCards } = require("../initialDate/cards.js");
const { User } = require("../models/users.js");
const { Card } = require("../models/cards.js");
// ייבוא הפורט והכתובת של אטלס כמשתנים גלובליים ושימוש בהן בעת פונקציית ההתחברות
const PORT = process.env.PORT || 3001;
const CONNECTION_STRING_ATLAS = process.env.CONNECTION_STRING_ATLAS;

// ייבוא הראוטינג של המשתמשים
const usersRouter = require("../routers/users");
const authRouter = require("../routers/auth");
const cardsRouter = require("../routers/cards");

// ייבוא הלוגר של שגיאות 400 ומעלה
const { writeLog } = require("../middleware/loger");
// מידלוואר עבור ניתוח נתונים בפורמנט גייסון

// מידלוואר של CORS
app.use(cors());

app.use(express.json());
app.use(require("morgan")("dev"));

// מידלוואר לתיעוד יומי של שגיאות של 400 ומעלה
app.use((req, res, next) => {
  // שמירת הערך של התגובה מצד השרת
  const oldSend = res.send;
  res.send = function (data) {
    if (res.statusCode >= 400) {
      // קבלת הפרמטרים לפונציית הכתיבה , הסטטוס קוד + המידע
      writeLog(res.statusCode, data);
    }
    //  קריאה לפונקציה המקורית עם כל הארגומנטים שנמסרו אליה, בצורה דינאמית
    oldSend.apply(res, arguments);
  };

  next();
});
// יצירת מידלווארים אשר יאפשרו גישה למורגן ולנייוט של פעולות CRUD של המשתמשים
app.use("/users", usersRouter);
app.use("/users", authRouter);
app.use("/cards", cardsRouter);

// מידלוואר עבור שגיאות שרת (סטטוס 500)
app.use((err, req, res, next) => {
  console.error(err.stack); // לוג של השגיאה בקונסולה
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message || "Something went wrong",
  });
});

connectToServers();

// פונקציה לחיבור והפעלת השרתים
async function connectToServers() {
  try {
    await mongoose.connect(CONNECTION_STRING_ATLAS);
    console.log("Connecting to Mongo DB");
    await injectInitialData();

    app.listen(PORT, () => {
      console.log("Server runing on PORT", PORT);
    });
  } catch (err) {
    console.log("Error to connect to MongoDB", err.message);
  }
}

// פונקציה להזרקת מידע ראשוני
async function injectInitialData() {
  try {
    // בדיקה אם יש משתמשים במאגר
    const usersFromDb = await User.find();

    // יצירת משתמשים פיקטיביים אם הם לא קיימים
    for (const user of initialUsers) {
      if (!usersFromDb.find((dbUser) => dbUser.email === user.email)) {
        const hashedPassword = await bcryp.hash(user.password, 12);
        const newUser = new User({ ...user, password: hashedPassword });
        const savedUser = await newUser.save();

        // אם המשתמש הוא עסקי, צור כרטיסים עבורו
        if (user.isBusiness) {
          for (const card of initialCards) {
            const newCard = new Card({ ...card, userId: savedUser._id });
            await newCard.save();
          }
        }
      }
    }

    console.log("Initial data injected successfully!");
  } catch (err) {
    console.error("Error injecting initial data:", err.message);
  }
}
