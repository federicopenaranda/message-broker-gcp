const { Storage } = require('@google-cloud/storage');
const googleIt = require('google-it'); // Simplified search wrapper
const storage = new Storage();
const bucket = storage.bucket('project-storage-federico-2026');

exports.handleNews = async (cloudEvent) => {
  const searchTerm = Buffer.from(cloudEvent.data.message.data, 'base64').toString();
  
  // Search for the news term
  const results = await googleIt({ 'query': searchTerm, 'limit': 1 });
  const content = results[0].snippet || "No snippet found";

  // Store in "news/" folder
  const file = bucket.file(`news/${searchTerm}_${Date.now()}.txt`);
  await file.save(content);
  console.log(`Saved news for: ${searchTerm}`);
};