const mongoose = require('mongoose');
const ServiceRequest = require('./models/ServiceRequest');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/service_marketplace')
  .then(async () => {
    console.log('MongoDB Connected');
    
    // Delete the corrupted requests made by the test script
    await ServiceRequest.deleteMany({ description: 'Leaking pipe test' });
    console.log('Deleted test requests that had fake corrupted images');
    
    process.exit(0);
  })
  .catch(err => console.error(err));
