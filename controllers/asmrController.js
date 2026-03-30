const AsmrVideo = require('../models/AsmrVideo');
const { put } = require('@vercel/blob');

// @desc    Get all ASMR videos
// @route   GET /api/asmr
// @access  Public
const getAsmrVideos = async (req, res) => {
    try {
        const videos = await AsmrVideo.find({ isVisible: true }).sort({ order: 1 });
        res.json(videos);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all ASMR videos for admin
// @route   GET /api/asmr/admin
// @access  Private/Admin
const getAsmrVideosAdmin = async (req, res) => {
    try {
        const videos = await AsmrVideo.find().sort({ order: 1 });
        res.json(videos);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Add an ASMR video
// @route   POST /api/asmr
// @access  Private/Admin
const addAsmrVideo = async (req, res) => {
    try {
        const { title, description, order, isVisible } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a video file' });
        }

        const blob = await put(req.file.originalname, req.file.buffer, {
            access: 'public',
            addRandomSuffix: false,
            allowOverwrite: true,
        });
        const videoUrl = blob.url;

        const newVideo = new AsmrVideo({
            title,
            description,
            videoUrl,
            order: order || 0,
            isVisible: isVisible !== undefined ? isVisible : true
        });

        const video = await newVideo.save();
        res.status(201).json(video);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update an ASMR video
// @route   PUT /api/asmr/:id
// @access  Private/Admin
const updateAsmrVideo = async (req, res) => {
    try {
        const { title, description, order, isVisible } = req.body;
        let updateData = { title, description, order, isVisible };

        if (req.file) {
            const blob = await put(req.file.originalname, req.file.buffer, {
                access: 'public',
                addRandomSuffix: false,
                allowOverwrite: true,
            });
            updateData.videoUrl = blob.url;
        }

        const video = await AsmrVideo.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!video) return res.status(404).json({ message: 'Video not found' });
        res.json(video);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Appreciate (like) an ASMR video
// @route   POST /api/asmr/:id/appreciate
// @access  Public
const appreciateVideo = async (req, res) => {
    try {
        const video = await AsmrVideo.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });
        
        video.appreciationCount += 1;
        await video.save();
        
        res.json({ appreciationCount: video.appreciationCount });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete an ASMR video
// @route   DELETE /api/asmr/:id
// @access  Private/Admin
const deleteAsmrVideo = async (req, res) => {
    try {
        const video = await AsmrVideo.findByIdAndDelete(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });
        res.json({ message: 'Video removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getAsmrVideos,
    getAsmrVideosAdmin,
    addAsmrVideo,
    updateAsmrVideo,
    appreciateVideo,
    deleteAsmrVideo,
};
