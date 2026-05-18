import { message } from 'antd';

/**
 * Downloads an image in JPEG format using weserv.nl proxy to avoid CORS and force format.
 * @param {string} url - The original image URL
 * @param {string} filename - Desired filename
 */
export const downloadImage = async (url, filename) => {
  if (!url) {
    message.error('No image URL provided');
    return;
  }

  const hide = message.loading('Preparing download...', 0);
  
  try {
    // Improved filename sanitization
    let baseName = (filename || 'image').replace(/\.[^/.]+$/, "");
    let cleanName = baseName
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    
    if (!cleanName) cleanName = 'image';
    const finalFilename = `${cleanName}.jpg`;

    // Use weserv.nl to get the image blob (avoids CORS issues and forces JPEG)
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=jpg&q=95`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('Fetch failed');
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Create link and trigger download
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = finalFilename;
    
    document.body.appendChild(a);
    a.click();
    
    // Keep in DOM a bit longer and then cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);
    
    hide();
    message.success(`Download started: ${finalFilename}`);
  } catch (error) {
    console.error('Download error:', error);
    hide();
    // Fallback: Direct download via proxy with attachment header
    const fallbackUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&output=jpg&q=95&download=${encodeURIComponent(filename || 'image.jpg')}`;
    window.location.href = fallbackUrl;
    message.warning('Using direct download fallback...');
  }
};
