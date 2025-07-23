const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  url:         {type: String, required: true},
  crawl:       {type: Boolean, default: false},
  status:      {
    type:    String,
    enum:    ['pending', 'in_progress', 'complete', 'error'],
    default: 'pending',
  },
  pageReports: [{type: mongoose.Schema.Types.ObjectId, ref: 'PageReport'}],
  createdAt:   {type: Date, default: Date.now},
  error:       {type: String},
});

module.exports = mongoose.model('Report', ReportSchema);
