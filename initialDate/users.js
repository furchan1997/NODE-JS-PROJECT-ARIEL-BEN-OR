const initialUsers = [
  {
    name: {
      first: "Ariel",
      middle: "William",
      last: "Doe",
    },
    phone: "0506595538",
    email: "arielUser3@gmail.com",
    password: "Aa123456!",
    image: {
      url: "https://example.com/business-image.jpg",
      alt: "Business Profile Picture",
    },
    address: {
      state: "California",
      country: "USA",
      city: "Los Angeles",
      street: "34",
      houseNumber: 123,
      zip: 100,
    },
    isBusiness: true,
  },
  {
    name: {
      first: "John",
      middle: "Michael",
      last: "Smith",
    },
    phone: "0541239876",
    email: "johnUser4@gmail.com",
    password: "Bb654321@",
    image: {
      url: "https://example.com/personal-image.jpg",
      alt: "Personal Profile Picture",
    },
    address: {
      state: "New York",
      country: "USA",
      city: "New York City",
      street: "5th Avenue",
      houseNumber: 101,
      zip: 100,
    },
    isBusiness: false,
  },
];

module.exports = { initialUsers };
