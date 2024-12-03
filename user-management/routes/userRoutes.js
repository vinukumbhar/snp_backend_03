

const express = require('express');
const {
  createUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const router = express.Router();

// Signup (Create user)
router.post('/signup', createUser);

// Login
router.post('/login', loginUser);

// Get all users
router.get('/', getUsers);

// Get a single user by ID
router.get('/:id', getUserById);

// Update a user by ID
router.put('/:id', updateUser);

// Delete a user by ID
router.delete('/:id', deleteUser);

module.exports = router;
