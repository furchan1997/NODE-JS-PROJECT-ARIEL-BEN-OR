// אובייקט מוכן עבור משתמש מסוג מנהל

const user = {
  name: {
    first: "John",
    middle: "William",
    last: "Doe",
  },
  phone: "0501234567",
  email: "ariel@admin.com",
  image: {
    url: "https://example.com/image.jpg",
    alt: "Profile Picture",
  },
  address: {
    state: "California",
    country: "USA",
    city: "Los Angeles",
    street: 34,
    houseNumber: 123,
    zip: 90,
  },
  isBusiness: true,
  isAdmin: true,
};

module.exports = user;
