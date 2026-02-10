const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('project-storage-federico-2026');

exports.handleTutorials = async (cloudEvent) => {
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
  // Accessing the secret that was mapped to GOOGLE_API_KEY
  const API_KEY = process.env.GOOGLE_API_KEY; 
  const CX = process.env.SEARCH_ENGINE_ID;

  if (!API_KEY) {
    throw new Error("API Key is missing! Check Secret Manager permissions.");
  }

  const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(searchTerm)} tutorials`;
  console.log('URL: ', url);
  
  try {
    console.log(`Searching Google for: "${searchTerm}"`);
    
    // 3. Perform the fetch request
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // 4. Check if we actually got results
    if (!data.items || data.items.length === 0) {
      console.log(`No results found for "${searchTerm}".`);
      return;
    }

    // 5. Get the first result (Title and Snippet)
    const firstResult = data.items[0];
    const contentToSave = `
      Search Term: ${searchTerm}
      Title: ${firstResult.title}
      Link: ${firstResult.link}
      Snippet: ${firstResult.snippet}
    `.trim();

    // 6. Save to your unique bucket
    const fileName = `news/${searchTerm.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.txt`;
    await bucket.file(fileName).save(contentToSave);
    console.log(`Successfully saved result to: ${fileName}`);
  } catch (error) {
    console.error("Critical error in handleNews:", error.message);
  }
};