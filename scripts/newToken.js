const config = require("../config/config");
const jwt = require("jsonwebtoken");
// לייצר טוקן JWT עם מטען מותאם אישית
function createToken({ id, biz, admin, key }) {
  const token = jwt.sign(
    {
      id,
      biz,
      admin,
    },
    key
  );
  return token;
}

module.exports = { createToken };
