import mongoose from 'mongoose';

const NewsSchema = mongoose.Schema({
    name: String,
    links: [{
        href: String,
        innerText: String
    }]
});

export const News = mongoose.model('News', NewsSchema);