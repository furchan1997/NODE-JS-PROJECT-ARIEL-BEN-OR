# פרויקט ניהול משתמשים וכרטיסים

פרויקט זה מיועד לניהול משתמשים וכרטיסים בעסק, שבו משתמשים יכולים ליצור כרטיסים, לערוך אותם, למחוק וכדומה. המערכת משתמשת במונגו די בי וב-Express.

## כלי פיתוח

במהלך הפיתוח השתמשנו בכלים ובספריות הבאות:

### תלותיות (dependencies)

- **bcrypt**: לשמירה על סיסמאות בצורה מוצפנת.
- **cors**: מתיר בעיות CORS בין השרת ללקוחות.
- **dotenv**: ניהול משתני סביבה מתוך קובץ `.env`.
- **express**: מסגרת עבודה לפיתוח יישומי רשת עם Node.js.
- **joi**: ספרייה לוולידציה של קלטים.
- **jsonwebtoken**: ספרייה ליצירת טוקנים מבוססי JWT.
- **lodash**: ספרייה המציעה פונקציות עזר לפשט את העבודה עם אובייקטים ומערכים.
- **mongoose**: ספרייה המחברת בין MongoDB ל-Node.js.

### תלותיות לפיתוח (devDependencies)

- **morgan**: אמצעי לוגינג עבור Express.
- **nodemon**: כלי להקרנת השרת מחדש אוטומטית במהלך הפיתוח.

## מדריך התקנה

1. **התקנת Node.js**:
   עליך להתקין את Node.js. ניתן להוריד אותו מהאתר הרשמי: [Node.js](https://nodejs.org/).

2. **התקנת תלויות**:
   לאחר שהתקנת את Node.js, עליך להתקין את התלויות:
   ```bash
   npm install
   ```

רכיבי המערכת
מודלים

יצורף קובץ .env לאתר הקמפוס אשר יכיל את המשתנים הבאים לפי דרישת המכללה:

1. CONNECTION_STRING_ATLAS
2. PORT
3. JWT_KEY
4. ADMIN_PASSWORD

**בסיסי נתונים-MONGO DB**:

הפרויקט עושה שימוש ב-MongoDB לצורך אחסון וניהול נתונים.


User: מייצג משתמש במערכת עם פרטי זיהוי כמו שם, טלפון, אימייל, סיסמה וכתובת. [file users.js](models/users.js)

Card: מייצג כרטיס עסקי עם פרטי זיהוי כמו שם עסק, טלפון, אימייל, כתובת ומספר עסק. [file cards.js](models/cards.js)

פונקציות עיקריות

יצירת משתמש חדש: ניתן להוסיף משתמשים חדשים למערכת עם ולידציה מתאימה.
התחברות: מאפשרת למשתמשים להתחבר בעזרת אימייל וסיסמה.
[file users.js](routers/users.js)

יצירת כרטיס חדש: משתמשים יכולים ליצור כרטיסים עסקיים, תוך כדי ווידוא שהם משתמשים עסקיים.
לייק לכרטיסים: משתמשים יכולים להוסיף או להסיר לייקים מכרטיסים.
[file cards.js](routers/cards.js)

מידלווארים:

1. authMW: אמת משתמשים ומוודא שהם מחוברים. [file auth.js](middleware/auth.js)
2. bizAuthMW: מוודא שמשתמש הוא עסקי לפני ביצוע שינויים בכרטיסים. [file bizAuth.js](middleware/bizAuth.js)
3. checkAuthorization: מוודא שמשתמשים יכולים לגשת רק לפרטי המשתמשים שלהם או למנהלים. [file checkAuth.js](middleware/checkAuth.js)
4. loger: מדפיס ושומר שגיאות 400 ומעלה עם הזמן המדוייק [file loger.js](middleware/loger.js)

אובייקטי שגיאות

בפרויקט ישנם אובייקטי שגיאות המאפשרים טיפול בשגיאות בצורה מסודרת ונוחה. להלן השגיאות השונות הנפוצות:
שגיאות עבור כרטיסים

[file cardsErr.js](errors/cardsErr.js)

1. CARD_NOT_FOUND: כרטיס לא נמצא.
2. BAD_REQUEST: בקשה רעה. יש לבדוק את הקלט שלך.
3. FORBIDDEN_USER: אתה חייב להיות משתמש עסקי.
4. UNAUTHORIZED_FOR_NOT_ADMIN: רק מנהל יכול לבצע פעולה זו.
5. UNAUTHORIZED_FOR_USER: רק בעל הכרטיס יכול לבצע פעולה זו.

שגיאות עבור משתמשים

[file usersErr.js](errors/usersErr.js)

1. USER_NOT_FOUND: לא נמצאו משתמשים.
2. INVALID_TOKEN: גישה נדחתה. טוקן נדרש.
3. FORBIDDEN: גישה נדחתה. רק מנהלים או בעלי חשבון יכולים לגשת.
4. FORBIDDEN_USER: גישה נדחתה. רק בעל החשבון יכול לגשת.

פונקציה מותאמת אישית עבור PICK
בנוסף, השתמשנו בפונקציה המותאמת אישית עבור pick מ-Lodash, המסננת את האובייקטים ומחזירה רק את השדות שצוינו. שימוש לדוגמה

[file dataPicker.js](config/dataPicker.js)

ישנה פונקציה מותאמת אישית עבור יצירת טוקן

[file newToken.js](scripts/newToken.js)

בונוסים :
עשיתי שני בונוסים מתוך שלוש.

1. שמנהל יכול לשנות מספר עסק לספר אחר באופן ידני בתנאי שהוא לא תפוס.
2. עשיתי מידלוואר של לוגר עבור הדפסת שגיאות 400 ומעלה

תוספות

השתמשתי בספריית jsonwebtoken ליצירת טוקנים המאמתים משתמשים.
השתמשתי ב-Joi לוולידציה של קלטים.

הודות
הפרויקט נכתב על ידי חיים אריאל בן אור.
