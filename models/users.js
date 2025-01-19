const mongoose = require("mongoose");
const joi = require("joi");
const {
  emailRegex,
  passwordRegex,
  phoneRegex,
} = require("../regex/regexSchema");

// יצירת סכמה משתמשים לדאטא בייס של מונגו
const userSchema = new mongoose.Schema({
  name: {
    first: {
      type: String,
      minlength: 2,
      maxlength: 256,
      required: true,
    },
    middle: {
      type: String,
      default: "",
    },
    last: {
      type: String,
      minlength: 2,
      maxlength: 256,
      required: true,
    },
  },

  phone: {
    type: String,
    minlength: 9,
    maxlength: 11,
    required: true,
  },

  email: {
    type: String,
    minlength: 9,
    unique: true,
    required: true,
  },

  password: {
    type: String,
    minlength: 7,
    required: true,
  },

  image: {
    url: {
      type: String,
      validate: {
        validator: function (v) {
          // אם הערך ריק, לא נבצע וולידציה על האורך
          if (!v) return true; // ערך ריק לא עובר וולידציה
          return v.length >= 14;
        },
        message: "Image URL must be at least 14 characters long.",
      },
    },
    alt: {
      type: String,
      default: "",
    },
  },

  address: {
    state: {
      type: String,
      validate: {
        validator: function (v) {
          // אם הערך ריק, לא נבצע וולידציה על האורך
          if (!v) return true; // ערך ריק לא עובר וולידציה
          return v.length >= 2;
        },
        message: "State must be at least 2 characters long.",
      },
    },
    country: {
      type: String,
      minlength: 2,
      maxlength: 256,
      required: true,
    },
    city: {
      type: String,
      minlength: 2,
      maxlength: 256,
      required: true,
    },
    street: {
      type: String,
      minlength: 2,
      maxlength: 256,
      required: true,
    },
    houseNumber: {
      type: Number,
      min: 2,
      max: 256,
      required: true,
    },
    zip: {
      type: Number,
      required: true,
      min: 1,
      max: 9_999_999_999,
    },
  },
  isBusiness: {
    type: Boolean,
    required: true,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema, "users");
// ולידציה של ג'וי
function validateUser(user, method) {
  const generalSchema = joi.object({
    name: joi
      .object({
        first: joi.string().min(2).max(256).required(),
        middle: joi.string().min(2).max(256).optional().allow("").default(""),
        last: joi.string().min(2).max(256).required(),
      })
      .required(),
    phone: joi.string().min(9).max(11).pattern(phoneRegex).required().messages({
      "string.min": "מספר הטלפון חייב להיות באורך של לפחות 9 תווים.",
      "string.max": "מספר הטלפון יכול להיות באורך של עד 11 תווים בלבד.",
      "string.pattern.base": "מספר הטלפון חייב להיות תקין לפי פורמט ישראלי.",
    }),
    email: joi.string().email().pattern(emailRegex).required(),
    password: joi.string().min(7).pattern(passwordRegex).required(),
    image: joi
      .object({
        url: joi.string().min(14).uri().optional().allow("").default(""),
        alt: joi.string().min(2).max(256).optional().allow("").default(""),
      })
      .optional(),
    address: joi
      .object({
        state: joi.string().min(2).max(256).optional().allow("").default(""),
        country: joi.string().min(2).max(256).required(),
        city: joi.string().min(2).max(256).required(),
        street: joi.string().min(2).max(256).required(),
        houseNumber: joi.number().required(),
        zip: joi.number().required(),
      })
      .required(),
    isBusiness: joi.boolean().required(),
  });

  const updateSchema = joi.object({
    isBusiness: joi.boolean().required(),
  });

  const changeDetailsSchema = joi.object({
    name: joi.object({
      first: joi.string().min(2).max(256).required(),
      middle: joi.string().min(2).max(256).optional().allow(""),
      last: joi.string().min(2).max(256).required(),
    }),
    phone: joi.string().min(9).max(11).pattern(phoneRegex).required().messages({
      "string.min": "מספר הטלפון חייב להיות באורך של לפחות 9 תווים.",
      "string.max": "מספר הטלפון יכול להיות באורך של עד 11 תווים בלבד.",
      "string.pattern.base": "מספר הטלפון חייב להיות תקין לפי פורמט ישראלי.",
    }),
    image: joi
      .object({
        url: joi.string().min(14).uri().optional().allow(""),
        alt: joi.string().min(2).max(256).optional().allow(""),
      })
      .optional(),
    address: joi
      .object({
        state: joi.string().min(2).max(256).optional().allow(""),
        country: joi.string().min(2).max(256).required(),
        city: joi.string().min(2).max(256).required(),
        street: joi.string().min(2).max(256).required(),
        houseNumber: joi.number().required(),
        zip: joi.number().required(),
      })
      .required(),
  });
  // אובייקט אשר מכיל ולידציות לשימוש עתידי ונוכחי
  const schemas = {
    POST: generalSchema,
    PATCH: updateSchema,
    PUT: changeDetailsSchema,
  };

  return schemas[method].validate(user);
}

module.exports = { User, validateUser };
