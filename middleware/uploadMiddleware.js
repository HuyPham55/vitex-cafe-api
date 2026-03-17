const multer = require('multer');
const path = require('path');

// Use Memory Storage for Vercel Blob
const storage = multer.memoryStorage();

// Check File Type for Videos
function checkVideoFileType(file, cb) {
    const filetypes = /mp4|m4v|mov|avi|wmv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Videos only!'));
    }
}

// Check File Type for Images
function checkImageFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Images only!'));
    }
}

// Video Upload Middleware
const videoUpload = multer({
    storage: storage,
    limits: { fileSize: 100000000 }, // 100MB limit
    fileFilter: function (req, file, cb) {
        checkVideoFileType(file, cb);
    }
});

// Image Upload Middleware
const imageUpload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        checkImageFileType(file, cb);
    }
});

module.exports = { videoUpload, imageUpload };
