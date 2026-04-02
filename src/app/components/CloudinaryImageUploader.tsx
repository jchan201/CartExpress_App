import { useEffect, useRef, useCallback, useMemo } from "react";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage, responsive, placeholder } from "@cloudinary/react";
import { Upload, X } from "lucide-react";

interface CloudinaryImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function CloudinaryImageUploader({
  images,
  onImagesChange,
  maxImages = 10,
}: CloudinaryImageUploaderProps) {
  const uploadButtonRef = useRef<HTMLButtonElement>(null);
  const uploadWidgetRef = useRef<any>(null);
  const onImagesChangeRef = useRef(onImagesChange);
  const imagesRef = useRef(images);

  // Keep refs updated with latest values
  useEffect(() => {
    onImagesChangeRef.current = onImagesChange;
    imagesRef.current = images;
  }, [images, onImagesChange]);

  const cloudName = 'dulayurvd';
  const uploadPreset = 'CartExpress';

  // Initialize Cloudinary instance for image display
  const cld = new Cloudinary({
    cloud: {
      cloudName,
    },
  });

  // Upload Widget Configuration - Memoized to prevent re-rendering issues
  const uwConfig = useMemo(
    () => ({
      cloudName,
      uploadPreset,
      multiple: false,
      maxFiles: 1,
      resourceType: "image",
      clientAllowedFormats: ["jpeg", "jpg", "png", "gif", "webp"],
      maxImageFileSize: 5000000, // 5MB
      folder: "cartexpress-products",
      showAdvancedOptions: false,
      cropping: false,
      sources: ["local", "url"],
    }),
    [cloudName, uploadPreset]
  );

  // Initialize upload widget on mount
  useEffect(() => {
    const initializeUploadWidget = () => {
      // Check if Cloudinary SDK is available
      if (!window.cloudinary) {
        console.error("Cloudinary SDK not loaded. Check if the script is properly included in index.html");
        return;
      }

      if (!uploadButtonRef.current) {
        console.warn("Upload button ref not available");
        return;
      }

      // Create upload widget
      uploadWidgetRef.current = window.cloudinary.createUploadWidget(
        uwConfig,
        (error: any, result: any) => {
          if (!error && result && result.event === "success") {
            const newImageUrl = result.info.secure_url;
            // Only pass the URL to parent
            onImagesChangeRef.current([...imagesRef.current, newImageUrl]);
          }
        }
      );

      // Add click event to open widget
      const handleUploadClick = (e: Event) => {
        e.preventDefault();
        if (uploadWidgetRef.current) {
          uploadWidgetRef.current.open();
        }
      };

      const buttonElement = uploadButtonRef.current;
      buttonElement.addEventListener("click", handleUploadClick);

      // Cleanup
      return () => {
        buttonElement.removeEventListener("click", handleUploadClick);
      };
    };

    // Wait for Cloudinary SDK to load
    let attempts = 0;
    const maxAttempts = 100; // Wait up to 10 seconds (100 * 100ms)

    const checkAndInitialize = () => {
      if (window.cloudinary) {
        const cleanup = initializeUploadWidget();
        return cleanup;
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkAndInitialize, 100);
      } else {
        console.error("Cloudinary SDK failed to load after waiting 10 seconds");
      }
    };

    checkAndInitialize();
  }, [uwConfig]);

  const handleRemoveImage = useCallback(
    (indexToRemove: number) => {
      // Remove from local state
      onImagesChange(images.filter((_, index) => index !== indexToRemove));
    },
    [images, onImagesChange]
  );

  const canAddMore = images.length < maxImages;

  // Extract public_id from Cloudinary URL
  const getPublicIdFromUrl = (url: string): string => {
    try {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
      return match ? match[1] : "";
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Product Images {images.length > 0 && `(${images.length})`}
      </label>

      {/* Upload Button */}
      {canAddMore && (
        <button
          ref={uploadButtonRef}
          type="button"
          className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-blue-600"
        >
          <Upload className="w-5 h-5" />
          Upload Image {images.length > 0 && `(${maxImages - images.length} remaining)`}
        </button>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => {
            const publicId = getPublicIdFromUrl(imageUrl);
            const cldImg = publicId ? cld.image(publicId) : null;

            return (
              <div
                key={`${imageUrl}-${index}`}
                className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square"
              >
                {cldImg ? (
                  <AdvancedImage
                    cldImg={cldImg}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                    plugins={[responsive(), placeholder()]}
                  />
                ) : (
                  <img
                    src={imageUrl}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-6 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
          No images uploaded yet. Click the upload button to add product images.
        </div>
      )}

      {/* Max Images Reached Message */}
      {!canAddMore && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          Maximum {maxImages} images reached. Remove an image to add more.
        </div>
      )}
    </div>
  );
}
