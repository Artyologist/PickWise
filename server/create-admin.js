require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise';

async function run() {
    await mongoose.connect(MONGO);
    
    const email = 'admin@pickwise.com';
    let user = await User.findOne({ email });
    
    if (!user) {
        user = new User({
            username: 'admin',
            email,
            password: 'admin123', // Model hook will hash this
            role: 'admin'
        });
    } else {
        user.role = 'admin';
    }
    
    await user.save();
    console.log('Admin user ready:', email, '/ admin123');
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
