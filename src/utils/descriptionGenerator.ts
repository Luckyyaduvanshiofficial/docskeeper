// Smart description generator based on filename parsing

const COMMON_ABBREVIATIONS: Record<string, string> = {
  'inv': 'Invoice',
  'rcpt': 'Receipt',
  'doc': 'Document',
  'cert': 'Certificate',
  'id': 'ID',
  'dl': 'Driving License',
  'pan': 'PAN Card',
  'aadhar': 'Aadhar Card',
  'aadhaar': 'Aadhar Card',
  'passport': 'Passport',
  'marksheet': 'Marksheet',
  'resume': 'Resume',
  'cv': 'CV',
  'img': 'Image',
  'pic': 'Picture',
  'photo': 'Photo',
  'scan': 'Scanned',
  'pdf': 'PDF',
  'bill': 'Bill',
  'stmt': 'Statement',
  'bank': 'Bank',
  'tax': 'Tax',
  'gst': 'GST',
  'itr': 'ITR',
  'form': 'Form',
  'app': 'Application',
  'reg': 'Registration',
  'lic': 'License',
  'ins': 'Insurance',
  'med': 'Medical',
  'report': 'Report',
  'rpt': 'Report',
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Academic': ['marksheet', 'certificate', 'degree', 'diploma', 'transcript', 'grade', 'school', 'college', 'university', 'exam', 'result'],
  'Receipts': ['receipt', 'rcpt', 'invoice', 'inv', 'bill', 'payment', 'purchase', 'order'],
  'ID Proofs': ['id', 'aadhar', 'aadhaar', 'pan', 'passport', 'license', 'dl', 'voter', 'driving'],
  'Personal': ['personal', 'private', 'resume', 'cv', 'photo', 'pic'],
  'Family': ['family', 'birth', 'marriage', 'death'],
};

export function generateDescription(fileName: string): string {
  // Remove file extension
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  
  // Split by common separators
  const parts = nameWithoutExt
    .split(/[-_\s.]+/)
    .filter(part => part.length > 0);
  
  // Process each part
  const processedParts: string[] = [];
  let dateFound = '';
  
  for (const part of parts) {
    const lowerPart = part.toLowerCase();
    
    // Check for date patterns
    const dateMatch = part.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/) ||
                      part.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/) ||
                      part.match(/^(\d{8})$/);
    
    if (dateMatch) {
      if (part.length === 8) {
        // YYYYMMDD or DDMMYYYY format
        dateFound = `${part.slice(0,4)}/${part.slice(4,6)}/${part.slice(6,8)}`;
      } else {
        dateFound = part;
      }
      continue;
    }
    
    // Skip pure numbers (likely random IDs)
    if (/^\d+$/.test(part) && part.length > 4) {
      continue;
    }
    
    // Check for abbreviations
    if (COMMON_ABBREVIATIONS[lowerPart]) {
      processedParts.push(COMMON_ABBREVIATIONS[lowerPart]);
      continue;
    }
    
    // Capitalize first letter
    const capitalized = part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    processedParts.push(capitalized);
  }
  
  // Build description
  let description = processedParts.join(' ').trim();
  
  if (dateFound) {
    description += ` (${dateFound})`;
  }
  
  // If description is too short or empty, use a generic one
  if (description.length < 3) {
    description = 'Document';
  }
  
  // Limit length for readability
  if (description.length > 80) {
    description = description.substring(0, 77) + '...';
  }
  
  return description;
}

export function suggestCategory(fileName: string): string | null {
  const lowerName = fileName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return category;
      }
    }
  }
  
  return null;
}
