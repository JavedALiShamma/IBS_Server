const mongoose = require('mongoose');

const QuranHadeesSchema = new mongoose.Schema({
    
    topic:{
        type: String,
        required: [true, 'Please enter the topic of Quran or Hadees'],
    },
    content:{
        type: String,
        required: [true, 'Please enter the content of Quran or Hadees s'],
    },
    translation:{
        type: String,
        required: [true, 'Please enter the translation of Quran or Hadees'],
    },
    reference:{
        type: String,
        default:null
        
    },
    sanad:{
        type:String,
        default: null
    },
    category:{
        type:String,
        enum:["Quran", "Hadees" , "Ajkar"],
        default:"Quran"
    }
    

})
module.exports = mongoose.model('QuranHadees', QuranHadeesSchema);