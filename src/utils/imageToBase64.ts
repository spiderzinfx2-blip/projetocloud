// Utility to convert external images to base64 for html2canvas export
// Uses a CORS proxy to fetch TMDB images

const CORS_PROXY = 'https://corsproxy.io/?';

export async function convertImageToBase64(imageUrl: string): Promise<string | null> {
  try {
    // If already a data URL, return as-is
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }

    // Use CORS proxy for external URLs
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(imageUrl)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        resolve(null);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
}

export async function convertAllImagesToBase64(container: HTMLElement): Promise<void> {
  const images = container.querySelectorAll('img');
  
  await Promise.all(
    Array.from(images).map(async (img) => {
      if (!img.src || img.src.startsWith('data:')) return;
      
      const base64 = await convertImageToBase64(img.src);
      if (base64) {
        img.src = base64;
      } else {
        // Hide image if conversion fails
        img.style.visibility = 'hidden';
      }
    })
  );
}
