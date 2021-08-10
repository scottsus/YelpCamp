const mongoose = require('mongoose');
const Campground = require('../models/campground');
const geoClient = require('@mapbox/mapbox-sdk/services/geocoding');
const geoCoding = geoClient({ accessToken: 'pk.eyJ1Ijoic3N1c2FudG8iLCJhIjoiY2tzNGNpMmd5Mm10aTJ2bzdiN2NyZ3V1NiJ9.oVzqeoLpbWqmM4Nr47xQpQ' });

const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Database Connected!');
    })
    .catch(err => {
        console.log('ERROR!');
        console.log(err);
    })

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i += 1) {
        const randomName = arr => arr[Math.floor(Math.random() * arr.length)];
        const randomPrice = () => Math.floor(Math.random() * 100) + 1;
        const randomLocation = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            title: `${randomName(descriptors)} ${randomName(places)}`,
            price: randomPrice(),
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laborum, eum velit! Vero ratione laborum quae vel rem, sunt repellendus omnis aliquam sit deleniti distinctio iste aspernatur illum? Laborum, dignissimos laboriosam!',
            location: `${cities[randomLocation].city}, ${cities[randomLocation].state}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[randomLocation].longitude,
                    cities[randomLocation].latitude
                ]
            },
            author: '6108dd0d46901803743f553d',
            images: [
                {
                    url: 'https://res.cloudinary.com/sirlordking/image/upload/v1628483948/Yelp-Camp/cuemrbqfrzhdmxquqaii.jpg',
                    filename: 'Yelp-Camp/cuemrbqfrzhdmxquqaii'
                },
                {
                    url: 'https://res.cloudinary.com/sirlordking/image/upload/v1628483948/Yelp-Camp/cgoo3l90lb78ffuyjf5n.jpg',
                    filename: 'Yelp-Camp/cgoo3l90lb78ffuyjf5n'
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    console.log('Closing Database...');
    mongoose.connection.close();
})