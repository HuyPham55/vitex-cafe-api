const express = require('express');
const router = express.Router();
const {
    getAsmrVideos,
    getAsmrVideosAdmin,
    addAsmrVideo,
    updateAsmrVideo,
    appreciateVideo,
    deleteAsmrVideo,
} = require('../controllers/asmrController');
const { protect } = require('../middleware/authMiddleware');
const { videoUpload } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getAsmrVideos);
router.post('/:id/appreciate', appreciateVideo);

// Private/Admin routes
router.get('/admin', protect, getAsmrVideosAdmin);
router.post('/', protect, videoUpload.single('video'), addAsmrVideo);
router.put('/:id', protect, videoUpload.single('video'), updateAsmrVideo);
router.delete('/:id', protect, deleteAsmrVideo);

module.exports = router;
