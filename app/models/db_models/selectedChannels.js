const mongoose  = require('mongoose');

class SelectedChannelsModel {
  constructor (mongoose) {
    this.mongoose = mongoose;
    this.model = this.createModel();
  }

  createModel () {
    const selectedChannelSchema = this.mongoose.Schema({
      teams: {
        type: Array,
        required: [true, 'teams are required']
      }
    });

    return this.mongoose.model('selectedChannel', selectedChannelSchema);
  }
}

exports.SelectedChannels = new SelectedChannelsModel(mongoose).model;
