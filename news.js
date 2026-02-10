const { Storage } = require('@google-cloud/storage');
const googleIt = require('google-it'); // Simplified search wrapper
const storage = new Storage();
const bucket = storage.bucket('project-storage-federico-2026');

exports.handleNews = async (cloudEvent) => {
  console.log("Full Event Object:", JSON.stringify(cloudEvent));

  // 1. Safely extract the message object
  const pubsubMessage = cloudEvent.data?.message || cloudEvent.data;

  console.log('pubsubMessage>', pubsubMessage);

  // 2. Check if data exists
  if (!pubsubMessage) {
    console.error("No Pub/Sub message data found in the event.");
    return;
  }

  // 3. Decode the base64 string
  const searchTerm = Buffer.from(pubsubMessage, 'base64').toString().trim();
  
  console.log(`Processing search for: ${searchTerm}`);
  
  // Search for the news term
  const results = await googleIt({ 'query': searchTerm, 'limit': 1 });
  const content = results[0].snippet || "No snippet found";

  // Store in "news/" folder
  const file = bucket.file(`news/${searchTerm}_${Date.now()}.txt`);
  await file.save(content);
  console.log(`Saved news for: ${searchTerm}`);
};