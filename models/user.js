const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: [true, 'This email has already been registered with Yelp Camp!']
    }
    // Username and Password are automatically added by Passport
})

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);