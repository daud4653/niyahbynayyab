import { cloudinary } from '../config/cloudinary.js';
import { env } from '../config/env.js';

function uploadToCloudinary(buffer, mimetype) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'niyah',
        resource_type: 'image',
        transformation: [
          {
            width: 1200,
            height: 1500,
            crop: 'limit',       // only shrinks, never upscales
            quality: 'auto',     // Cloudinary picks optimal quality
            fetch_format: 'auto', // serves WebP / AVIF where supported
          },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export async function uploadImages(req, res) {
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    return res.status(503).json({ message: 'Image upload is not configured. Add Cloudinary keys to .env.' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No image files provided' });
  }

  const urls = await Promise.all(
    req.files.map((file) => uploadToCloudinary(file.buffer, file.mimetype))
  );

  return res.json({ urls });
}
