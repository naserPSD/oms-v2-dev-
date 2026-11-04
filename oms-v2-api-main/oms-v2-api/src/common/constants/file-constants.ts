export const ALLOWED_FILE_TYPES = [
  'application/pdf', // PDF files

  // Microsoft Word formats
  'application/msword', // .doc (old Microsoft Word format)
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx (modern Word format)

  // Alternative DOC MIME types
  'application/doc', // Rarely used, but included for compatibility
  'application/vnd.ms-word', // Another variation for .doc
];

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', // JPEG images
  'image/jpg',
  'image/png', // PNG images
  'image/webp', // WebP images
  // 'image/gif', // GIF images
  // 'image/bmp', // BMP images
  // 'image/svg+xml', // SVG images
  // 'image/x-icon', // Icon images
  // 'image/tiff', // TIFF images
  // 'image/vnd.microsoft.icon', // Icon images
  // 'image/x-icon', // Icon images
];

export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/ogg', 'audio/wav'];
export const ALLOWED_ARCHIVE_TYPES = ['application/zip', 'application/gzip'];

export const ALLOWED_IMAGE_AND_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/doc',
  'application/docs',
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_LOGO_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const MAX_LOGO_FILE_SIZE = 15 * 1024 * 1024; // 15MB

