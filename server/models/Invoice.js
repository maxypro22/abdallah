const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['paid', 'pending'], default: 'pending' },
    dueDate: { type: Date },
    lawFirmId: { type: mongoose.Schema.Types.ObjectId, ref: 'LawFirm', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
