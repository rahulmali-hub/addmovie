const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = new User({ username, password, role });
    await user.save();
    res.status(201).send({ message: 'User registered' });
  } catch (error) {
    res.status(400).send({ message: 'Error registering user', error });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.send({ token });
    console.log(token)
  } catch (error) {
    res.status(400).send({ message: 'Error logging in', error });
  }
});

module.exports = router;
