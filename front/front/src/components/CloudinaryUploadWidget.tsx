import { useEffect, useRef } from 'react';
import type { CloudinaryUploadWidgetOptions } from 'cloudinary-core';
import * as React from 'react';
import { Handshake } from '@mui/icons-material';

declare global {
    interface Window {
        cloudinary:any;
    }
}

interface CloudinaryUploadWidgetProps {
  uwConfig: CloudinaryUploadWidgetOptions;
  setPublicId: (publicId: string) => void;
}


const CloudinaryUploadWidget = ({ uwConfig, setPublicId }: CloudinaryUploadWidgetProps) => {
  const uploadWidgetRef = useRef<any>(null);

  useEffect(() => {
    const initializeUploadWidget = () => {
      if (window.cloudinary) {
        // Create upload widget
        uploadWidgetRef.current = window.cloudinary.createUploadWidget(
          uwConfig,
          (error: any, result: any) => {
            if (!error && result && result.event === 'success') {
              console.log('Upload successful:', result.info);
              setPublicId(result.info.public_id);
            }
          }
        );
      }
    };
    
    initializeUploadWidget();
  }, [uwConfig, setPublicId]);

  const handleClick =  () => {
      uploadWidgetRef.current?.open();
  };
  
  return (
    <button
      id="upload_widget"
      className="cloudinary-button"
      onClick = {handleClick}
    >
      Upload
    </button>
  );
};

export default CloudinaryUploadWidget;
