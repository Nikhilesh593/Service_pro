const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    console.log('--- REGISTER HIT ---');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    const { name, email, password, role, phone, address, services } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password and role are required.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Auto-approve customers, others pending
    const status = (role === 'customer' || role === 'admin') ? 'approved' : 'pending';

    // Build the document path if a file was uploaded
    const documentPath = req.file ? `/uploads/docs/${req.file.filename}` : undefined;

    // Parse services JSON string if provided
    let parsedServices;
    if (services) {
      try { parsedServices = JSON.parse(services); } catch { parsedServices = []; }
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      status,
      phone,
      address,
      ...(documentPath && { documents: [documentPath] }),
      ...(parsedServices && { services: parsedServices }),
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status !== 'approved' && user.role !== 'customer') {
      return res.status(403).json({ message: 'Account not approved yet. Please wait for admin approval.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
