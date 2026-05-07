const mongoose = require('mongoose');
const ServiceRequest = require('./models/ServiceRequest');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/service_marketplace')
  .then(async () => {
    console.log('MongoDB Connected');
    const requests = await ServiceRequest.find().sort({ createdAt: 1 });
    console.log('Total Requests:', requests.length);
    requests.forEach(r => {
      console.log(`ID: ${r._id}, Created: ${r.createdAt}, Photo: "${r.faultPhoto}"`);
    });
    process.exit(0);
  })
  .catch(err => console.error(err));
