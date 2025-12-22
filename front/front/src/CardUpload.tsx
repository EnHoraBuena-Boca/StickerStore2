import  { useState } from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage, responsive, placeholder } from '@cloudinary/react';

import CloudinaryUploadWidget from './components/CloudinaryUploadWidget.tsx';
import './css/Card_Upload.css';
import type { CloudinaryUploadWidgetOptions } from 'cloudinary-core';




export default function CardUpload() {
  const cloudName = 'hzxyensd5';
  const uploadPreset = 'aoh4fpwm';

  // State
  const [publicId, setPublicId] = useState('');

  // Cloudinary configuration
  const cld = new Cloudinary({
    cloud: {
      cloudName,
    },
  });

  // Upload Widget Configuration
  const uwConfig: CloudinaryUploadWidgetOptions = {
    cloudName,
    uploadPreset,
    // Uncomment and modify as needed:
    // cropping: true,
    // showAdvancedOptions: true,
    // sources: ['local', 'url'],
    // multiple: false,
    // folder: 'user_images',
    // tags: ['users', 'profile'],
    // context: { alt: 'user_uploaded' },
    // clientAllowedFormats: ['images'],
    // maxImageFileSize: 2000000,
    // maxImageWidth: 2000,
    // theme: 'purple',
  };

  return (
    <div className="App">
      <h3>Upload Widget</h3>

      <CloudinaryUploadWidget uwConfig={uwConfig} setPublicId={setPublicId} />

      {publicId && (
        <div
          className="image-preview"
          style={{ width: '800px', margin: '20px auto' }}
        >
          <AdvancedImage
            style={{ maxWidth: '100%' }}
            cldImg={cld.image(publicId)}
            plugins={[responsive(), placeholder()]}
          />
        </div>
      )}
    </div>
  )
}