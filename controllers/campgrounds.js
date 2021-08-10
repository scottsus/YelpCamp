const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const geoClient = require('@mapbox/mapbox-sdk/services/geocoding');
const geoCoding = geoClient({ accessToken: process.env.MAPBOX_TOKEN });

module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.newCampgroundForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.newCampground = async (req, res, next) => {
    const newCampground = new Campground(req.body);
    const geoData = await geoCoding.forwardGeocode({
        query: req.body.location
    }).send();
    newCampground.geometry = geoData.body.features[0].geometry;
    newCampground.images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${newCampground._id}`);
};

module.exports.details = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate(
        {
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }
    ).populate('author');
    if (!campground) {
        req.flash('error', 'Campground may have been moved, deleted, or does not exist!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/details', { campground });
};

module.exports.editCampgroundForm = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
};

module.exports.editCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground may have been moved, deleted, or does not exist!');
        return res.redirect('/campgrounds');
    }
    const updatedCampground = await Campground.findByIdAndUpdate(id, req.body);
    const images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    updatedCampground.images.push(...images);
    await updatedCampground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${updatedCampground._id}`);
};

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
};