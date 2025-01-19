// אם היוזר שהכניס את הפרטים לא תואם למזהה שהוגדר כפרמטר ובנוסף זה לא המנהל תעצור את התהליך
module.exports = (req, res, next) => {
  if (req.user.id !== req.params.id && !req.user.admin) {
    res.status(403).json({ message: "Unauthorized access" });
    return;
  }

  next();
};
