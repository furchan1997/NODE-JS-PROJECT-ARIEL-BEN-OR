const mongoose = require("mongoose");
const joi = require("joi");
const _ = require("lodash");
// סכמת מונגו עבור כרטיסים
const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: 2,
    maxlength: 256,
    required: true,
  },
  subtitle: {
    type: String,
    minlength: 2,
    maxlength: 256,
    required: true,
  },
  description: {
    type: String,
    minlength: 2,
    maxlength: 1024,
    required: true,
  },
  phone: {
    type: String,
    minlength: 9,
    maxlength: 11,
    required: true,
  },
  email: {
    type: String,
    minlength: 5,
    required: true,
  },
  web: {
    type: String,
    default: "",
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
      default: "", // ברירת מחדל
    },
  },
  address: {
    state: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    houseNumber: {
      type: Number,
      min: 1,
      required: true,
    },
    zip: {
      type: Number,
      min: 100,
      max: 9_999_999,
    },
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  bizNumber: {
    type: Number,
    required: true,
    min: 100,
    max: 9_999_999_999,
    unique: true,
  },
  likes: {
    type: Array,
    default: [],
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

const Card = mongoose.model("Card", cardSchema, "cards");
// סכמה של ג'וי עבור הכרטיסים
function validateCard(card, isAdmin = false) {
  const updateCardByUser = joi.object({
    title: joi.string().min(2).max(256).required(),
    subtitle: joi.string().min(2).max(256).required(),
    description: joi.string().min(2).max(1024).required(),
    phone: joi.string().min(9).max(11).required(),
    email: joi.string().min(5).required(),
    web: joi.string().min(14).allow("").default("").optional(),
    image: {
      url: joi.string().min(14).optional().allow("").default(""),
      alt: joi.string().min(2).max(256).optional().allow("").default(""),
    },
    address: {
      state: joi.string().optional().allow("").default(""),
      country: joi.string().required(),
      city: joi.string().required(),
      street: joi.string().required(),
      houseNumber: joi.number().min(1).required(),
      zip: joi.number().optional().allow("").default(""),
    },
  });

  const updateCardByAdmin = joi.object({
    bizNumber: joi.number().min(100).max(9_999_999_999).required(),
  });
  // בדיקה האם זהו עדכון מצד המנהל או מצד בעל הכרטיס
  const schema = isAdmin ? updateCardByAdmin : updateCardByUser;
  return schema.validate(card);
}
// לולאה שמטרתה להביא מספר רנדומלי לכרטיס ובדיקה האם מספר תפוס
async function generateBizNumber() {
  while (true) {
    const random = _.random(100, 9_999_999_999);
    const card = await Card.findOne({ bizNumber: random });

    if (!card) {
      return random;
    }
  }
}

module.exports = {
  Card,
  validateCard,
  generateBizNumber,
};
