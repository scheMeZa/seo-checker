const mongoose = require('mongoose');

const PageReportSchema = new mongoose.Schema({
  report:          {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true,
  },
  url:             {type: String, required: true},
  seoScore:        {type: Number},
  recommendations: [{type: String}],
  status:          {
    type:    String,
    enum:    ['pending', 'in_progress', 'crawling', 'auditing', 'complete', 'error'],
    default: 'pending',
  },
  createdAt:       {type: Date, default: Date.now},
  error:           {type: String},
  lighthouseResult: {type: mongoose.Schema.Types.Mixed},
});

module.exports = mongoose.model('PageReport', PageReportSchema);
