const { Storage } = require('@google-cloud/storage');
const googleIt = require('google-it'); // Simplified search wrapper
const storage = new Storage();
const bucket = storage.bucket('project-storage');

exports.handleTutorials = async (cloudEvent) => {
  const searchTerm = Buffer.from(cloudEvent.data.message.data, 'base64').toString();
  
  // Search for the tutorial term
  const results = await googleIt({ 'query': searchTerm + ' tutorial', 'limit': 1 });
  const content = results[0].snippet || "No snippet found";

  // Store in "tutorials/" folder
  const file = bucket.file(`tutorials/${searchTerm}_${Date.now()}.txt`);
  await file.save(content);
  console.log(`Saved tutorials for: ${searchTerm}`);
};