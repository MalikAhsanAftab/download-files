require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const fileRouter = require('./routes/fileRouter');

// Replace bodyParser middleware with express.json() and express.urlencoded() middleware
app.use(express.json()); // To parse JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// Serve static files from a directory named 'public'
app.use(express.static('static_assets'));

// Set up routes
app.use('/files/', fileRouter);


// Define your endpoint to generate a pre-signed URL
app.post('/get-zip', (req, res) => {
    console.log("Request body :" , req.body );

    // Bucket name and object key
    const bucketName = 'YOUR_BUCKET_NAME';
    const objectKey = 'YOUR_OBJECT_KEY';
  
    // Set expiration time for the pre-signed URL (e.g., valid for 1 minute)
    const urlExpirationSeconds = 60;
  
    // Generate a pre-signed URL with limited access
    const params = {
      Bucket: bucketName,
      Key: objectKey,
      Expires: urlExpirationSeconds
    };
  
    s3.getSignedUrl('getObject', params, (err, url) => {
      if (err) {
        console.error('Error generating pre-signed URL:', err);
        res.status(500).send('Error generating URL');
        return;
      }
  
      res.send(url);
    });
  });





app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});