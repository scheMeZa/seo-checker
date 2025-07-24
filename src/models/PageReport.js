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
    enum:    ['pending', 'in_progress', 'crawling', 'crawled', 'auditing', 'complete', 'error'],
    default: 'pending',
  },
  error:           {type: String},
  lighthouseResult: {type: mongoose.Schema.Types.Mixed},
}, { timestamps: true });

module.exports = mongoose.model('PageReport', PageReportSchema);
