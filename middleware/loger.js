const { log } = require("node:console");
const fs = require("node:fs");
const path = require("path");

// הגדרת הנתיבים במיקומם המדוייק
const projectRoot = path.resolve(__dirname, "..");
const directoryLog = path.join(projectRoot, "logs");
// יצירת תיקייה חדשה
async function createLogDirectory() {
  try {
    await fs.promises.mkdir(directoryLog, { recursive: true });
  } catch (err) {
    console.error("Error creating log directory:", err.message);
  }
}
createLogDirectory();
// יצירת קובץ לתקייה שנוצרה ,כתיבת שגיאות, הסטטוס הרלוונטי, ופורמנט תאריך עבור שם הקובץ
async function writeLog(status, msg) {
  // הגדרת תאריך
  const today = new Date();
  const formattedDate = `${today.getFullYear()}_${String(
    today.getMonth() + 1
  ).padStart(2, "0")}_${String(today.getDate()).padStart(2, "0")}`;
  // התאריך היומי עבור שם הקובץ היומי
  const fileName = `${formattedDate}.txt`;
  // אובייקט אשר יקבל כפרמטרים של התאריך , הסטטוס, וההודעה לכל שגיאה
  const logFile = path.join(directoryLog, fileName);
  const details = {
    date: new Date(),
    status: status,
    message: msg,
  };
  // המרת המידע לפורמט ג'ייסון כסטרינג
  const logMsg = JSON.stringify(details) + "\n";

  try {
    //  פונקציה אסינכרונית שמוסיפה תוכן חדש לקובץ שצויין
    await fs.promises.appendFile(logFile, logMsg, "utf-8");
  } catch (err) {
    console.error("Error writing log:", err.message);
  }
}

module.exports = { writeLog };
