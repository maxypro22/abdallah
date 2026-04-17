const mongoose = require('mongoose');

const lawFirmSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ownerEmail: { type: String, required: true, unique: true },
    subscriptionStatus: { type: String, enum: ['active', 'trial', 'expired'], default: 'trial' },
    address: String,
    phone: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LawFirm', lawFirmSchema);
