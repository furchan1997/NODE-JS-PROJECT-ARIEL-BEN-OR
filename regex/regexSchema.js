const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^[A-Z](?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*-]).{6,}$/;
const phoneRegex = /^(0[2-47-9]\d{6}|05\d{8})$/;

module.exports = { emailRegex, passwordRegex, phoneRegex };
