const { User } = require("../models/users");
const bcrypt = require("bcrypt");
const admin = require("../initialDate/userAdmin");
// יצירת אדמין באופן אוטומטי לבסיס נתונים
async function createAdminUser() {
  // בדיקה האם אדמין קיים לפי האיימיל
  const existingAdmin = await User.findOne({ email: "ariel@admin.com" });
  // אם לא קיים תיצור אותו
  if (!existingAdmin) {
    // הצפנת סיסמא, הסיסמא שמורה בקובץ ה-ENV
    const passwordHashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    // יצירת משתמש חדש ושמירתו בבסיס הנתונים
    await new User({
      // ייבוא אובייקט אדמין מוכן
      ...admin,
      password: passwordHashed,
    }).save();
  } else {
    console.error("Admin user already exists.");
  }
}

createAdminUser();
