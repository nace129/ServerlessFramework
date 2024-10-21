// const AWS = require('aws-sdk');
// const sharp = require('@aws-lambda/sharp');  // AWS-optimized sharp
// const fs = require('fs');
// const path = require('path');

// const s3 = new AWS.S3();

// const dogeImages = [
//   'doge1.jpg',  // Example Doge image filenames
//   'doge2.jpg',
//   'doge3.jpg',
//   'doge4.jpg',
//   'doge.jpg'
// ];

// const bucketName = 'doge-memes-<random_string>';  // Your S3 bucket name

// // Helper function to generate random colors
// const getRandomColor = () => {
//   const letters = '0123456789ABCDEF';
//   let color = '#';
//   for (let i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 16)];
//   }
//   return color;
// };

// // Helper function to generate random position for text
// const getRandomPosition = (width, height) => {
//   return {
//     x: Math.floor(Math.random() * (width - 200)),
//     y: Math.floor(Math.random() * (height - 50))
//   };
// };

// module.exports.generateMeme = async (event) => {
//   console.log('Received event:', JSON.stringify(event, null, 2));  // Log the event

//   try {
//     console.log("Starting meme generation...");

//     // Randomly choose a Doge image
//     const randomImage = dogeImages[Math.floor(Math.random() * dogeImages.length)];
//     console.log(`Selected Doge image: ${randomImage}`);

//     // Load the selected Doge image
//     const imagePath = path.join(__dirname, 'doge_images', randomImage);
//     console.log(`Loading Doge image from path: ${imagePath}`);

//     const imageBuffer = fs.readFileSync(imagePath);
//     console.log("Doge image loaded successfully.");

//     // Create meme by adding text to the image
//     const width = 800;
//     const height = 600;
//     const randomText = "WOW, SUCH MEME!";
//     const randomColor = getRandomColor();
//     const { x, y } = getRandomPosition(width, height);

//     console.log(`Adding text: "${randomText}" at position (${x}, ${y}) with color: ${randomColor}`);

//     const memeBuffer = await sharp(imageBuffer)
//       .resize(width, height)
//       .composite([{
//         input: Buffer.from(
//           `<svg width="${width}" height="${height}">
//             <text x="${x}" y="${y}" font-size="50" fill="${randomColor}">${randomText}</text>
//           </svg>`
//         ),
//         top: 0,
//         left: 0
//       }])
//       .toBuffer();

//     console.log("Image manipulation complete.");

//     // Generate a unique filename for the meme
//     const memeFileName = `doge-meme-${Date.now()}.png`;

//     // Upload the meme to S3
//     const uploadParams = {
//       Bucket: bucketName,
//       Key: memeFileName,
//       Body: memeBuffer,
//       ContentType: 'image/png',
//     };

//     console.log(`Uploading meme to S3 with key: ${memeFileName}`);
//     const uploadResult = await s3.upload(uploadParams).promise();

//     console.log("Meme uploaded to S3 successfully.");
//     console.log('Upload result:', uploadResult);

//     return {
//       statusCode: 200,
//       body: JSON.stringify({
//         message: 'Doge meme generated successfully!',
//         memeUrl: uploadResult.Location
//       }),
//     };
//   } catch (error) {
//     console.error("Error generating meme:", error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         message: 'Error generating meme',
//         error: error.message,
//       }),
//     };
//   }
// };


// const AWS = require('aws-sdk');
// const sharp = require('sharp');
// const s3 = new AWS.S3();

// module.exports.getRoot = async () => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify({ message: 'Welcome to the root route!' }),
//   };
// };


// module.exports.processImage = async (event) => {
//   const { bucketName, key } = JSON.parse(event.body); // Assuming you send S3 info in the request body
//   const s3Params = {
//     Bucket: bucketName,
//     Key: key
//   };

//   try {
//     const { Body } = await s3.getObject(s3Params).promise();

//     // Process the image with Sharp (e.g., resize)
//     const resizedImage = await sharp(Body)
//       .resize(200, 200)
//       .toBuffer();

//     // Upload the processed image back to S3
//     const uploadParams = {
//       Bucket: bucketName,
//       Key: `resized-${key}`,
//       Body: resizedImage,
//       ContentType: 'image/jpeg'
//     };

//     await s3.putObject(uploadParams).promise();

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: 'Image processed successfully!' })
//     };
//   } catch (error) {
//     console.error('Error processing image:', error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ message: 'Internal server error' })
//     };
//   }
// };

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports.getDogeImage = async () => {
  const bucketName = 'doge-memes-bucket'; // Replace with your actual bucket name
  const prefix = 'doge-images/'; // Folder where your doge images are stored (optional)
  
  try {
    // List objects (images) in the S3 bucket under the specified prefix
    const data = await s3.listObjectsV2({ 
      Bucket: bucketName, 
      Prefix: prefix 
    }).promise();
    
    if (data.Contents.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No doge images found!' }),
      };
    }
    
    // Select a random image from the list of doge images
    const randomImage = data.Contents[Math.floor(Math.random() * data.Contents.length)];
    
    // Generate the S3 URL for the image
    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${randomImage.Key}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ imageUrl: imageUrl }), // Send the URL of the doge image
    };
  } catch (error) {
    console.error('Error fetching doge image:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

