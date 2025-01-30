const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());

const clearCookies = (req, res, next) => {
  const cookies = req.cookies;
  for (const cookieName in cookies) {
    if (cookies.hasOwnProperty(cookieName)) {
      res.clearCookie(cookieName);
    }
  }
  next();
};

app.use(clearCookies);


app.get('/', (req, res) => {
  res.send('All cookies cleared');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // console.log(`Server is running on port ${PORT}`);
});