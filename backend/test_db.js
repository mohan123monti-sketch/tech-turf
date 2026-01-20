
import mongoose from 'mongoose';
const uri = "mongodb://127.0.0.1:27017/test_db";
mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 })
    .then(() => { console.log("LOCAL_WORKS"); process.exit(0); })
    .catch((err) => { console.log("LOCAL_FAILS"); process.exit(1); });
