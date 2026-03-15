/// <reference types="vite/client" />

interface Window {
  cloudinary: {
    createUploadWidget(
      config: Record<string, any>,
      callback: (error: any, result: any) => void
    ): {
      open: () => void;
      close: () => void;
    };
  };
}
