const _ = require("lodash");
// לסנן אובייקט בודד או מערך של אובייקטים ולהשאיר רק את השדות שצוינו.
module.exports = (obj, DataField = []) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => _.pick(item, DataField));
  }

  return _.pick(obj, DataField);
};
