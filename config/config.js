// לזרוק שגיאה עם הודעה מותאמת במידה וסביבת הריצה (env) חסרה משתנה קריטי.
// ומבטיח ששגיאות סביבתיות יאותרו בזמן ריצה מוקדם ככל האפשר
function configError(message) {
  throw new Error(message);
}

module.exports = {
  jwtkey: process.env.JWT_KEY ?? configError("env var is missing"),
};
