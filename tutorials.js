const { Storage } = require('@google-cloud/storage');
const googleIt = require('google-it'); // Simplified search wrapper
const storage = new Storage();
const bucket = storage.bucket('project-storage-federico-2026');

exports.handleTutorials = async (cloudEvent) => {
  // 1. Safely extract the message object
  const pubsubMessage = cloudEvent.data?.message || cloudEvent.data;

  // 2. Check if data exists
  if (!pubsubMessage || !pubsubMessage.data) {
    console.error("No Pub/Sub message data found in the event.");
    return;
  }

  // 3. Decode the base64 string
  const searchTerm = Buffer.from(pubsubMessage.data, 'base64').toString().trim();
  
  console.log(`Processing search for: ${searchTerm}`);
  
  // Search for the tutorial term
  const results = await googleIt({ 'query': searchTerm + ' tutorial', 'limit': 1 });
  const content = results[0].snippet || "No snippet found";

  // Store in "tutorials/" folder
  const file = bucket.file(`tutorials/${searchTerm}_${Date.now()}.txt`);
  await file.save(content);
  console.log(`Saved tutorials for: ${searchTerm}`);
};