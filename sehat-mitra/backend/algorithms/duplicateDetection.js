/**
 * Hash table implementation for duplicate detection
 */
class HashTable {
  constructor(size = 997) { // Prime number for better distribution
    this.size = size;
    this.buckets = new Array(size).fill(null).map(() => []);
    this.count = 0;
  }

  // Hash function using djb2 algorithm
  hash(key) {
    let hash = 5381;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) + hash) + key.charCodeAt(i);
    }
    return Math.abs(hash) % this.size;
  }

  // Insert key-value pair
  set(key, value) {
    const index = this.hash(key);
    const bucket = this.buckets[index];
    
    // Check if key already exists
    const existingItem = bucket.find(item => item.key === key);
    if (existingItem) {
      existingItem.value = value;
      return false; // Indicates duplicate
    }
    
    bucket.push({ key, value });
    this.count++;
    return true; // New entry
  }

  // Get value by key
  get(key) {
    const index = this.hash(key);
    const bucket = this.buckets[index];
    const item = bucket.find(item => item.key === key);
    return item ? item.value : null;
  }

  // Check if key exists
  has(key) {
    return this.get(key) !== null;
  }

  // Remove key
  delete(key) {
    const index = this.hash(key);
    const bucket = this.buckets[index];
    const itemIndex = bucket.findIndex(item => item.key === key);
    
    if (itemIndex !== -1) {
      bucket.splice(itemIndex, 1);
      this.count--;
      return true;
    }
    return false;
  }

  // Get all keys
  keys() {
    const keys = [];
    for (let bucket of this.buckets) {
      for (let item of bucket) {
        keys.push(item.key);
      }
    }
    return keys;
  }

  // Get load factor
  getLoadFactor() {
    return this.count / this.size;
  }
}

/**
 * Duplicate customer detection system
 */
class DuplicateDetector {
  constructor() {
    this.emailHash = new HashTable();
    this.phoneHash = new HashTable();
    this.nameHash = new HashTable();
  }

  // Generate normalized key for name matching
  normalizeNameKey(firstName, lastName) {
    const fullName = `${firstName} ${lastName}`.toLowerCase()
      .replace(/[^a-z\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ')      // Normalize spaces
      .trim();
    return fullName;
  }

  // Generate normalized phone key
  normalizePhoneKey(phone) {
    return phone.replace(/\D/g, ''); // Remove all non-digits
  }

  // Check for duplicates when adding new customer
  checkDuplicate(customer) {
    const duplicates = {
      email: null,
      phone: null,
      name: null,
      isDuplicate: false
    };

    // Check email duplicate
    if (customer.email) {
      const emailKey = customer.email.toLowerCase();
      const existingEmailCustomer = this.emailHash.get(emailKey);
      if (existingEmailCustomer) {
        duplicates.email = existingEmailCustomer;
        duplicates.isDuplicate = true;
      }
    }

    // Check phone duplicate
    if (customer.phone) {
      const phoneKey = this.normalizePhoneKey(customer.phone);
      const existingPhoneCustomer = this.phoneHash.get(phoneKey);
      if (existingPhoneCustomer) {
        duplicates.phone = existingPhoneCustomer;
        duplicates.isDuplicate = true;
      }
    }

    // Check name duplicate (fuzzy matching)
    if (customer.firstName && customer.lastName) {
      const nameKey = this.normalizeNameKey(customer.firstName, customer.lastName);
      const existingNameCustomer = this.nameHash.get(nameKey);
      if (existingNameCustomer) {
        duplicates.name = existingNameCustomer;
        // Name duplicates are less definitive, so we flag but don't block
      }
    }

    return duplicates;
  }

  // Add customer to hash tables
  addCustomer(customer) {
    const duplicateCheck = this.checkDuplicate(customer);
    
    if (duplicateCheck.isDuplicate) {
      return {
        success: false,
        duplicates: duplicateCheck,
        message: 'Duplicate customer detected'
      };
    }

    // Add to hash tables
    if (customer.email) {
      this.emailHash.set(customer.email.toLowerCase(), customer);
    }
    
    if (customer.phone) {
      this.phoneHash.set(this.normalizePhoneKey(customer.phone), customer);
    }
    
    if (customer.firstName && customer.lastName) {
      const nameKey = this.normalizeNameKey(customer.firstName, customer.lastName);
      this.nameHash.set(nameKey, customer);
    }

    return {
      success: true,
      duplicates: duplicateCheck,
      message: 'Customer added successfully'
    };
  }

  // Remove customer from hash tables
  removeCustomer(customer) {
    if (customer.email) {
      this.emailHash.delete(customer.email.toLowerCase());
    }
    
    if (customer.phone) {
      this.phoneHash.delete(this.normalizePhoneKey(customer.phone));
    }
    
    if (customer.firstName && customer.lastName) {
      const nameKey = this.normalizeNameKey(customer.firstName, customer.lastName);
      this.nameHash.delete(nameKey);
    }
  }

  // Find potential duplicates for existing customer
  findPotentialDuplicates(customer) {
    const potentials = [];

    // Check similar names (Levenshtein distance)
    const customerNameKey = this.normalizeNameKey(customer.firstName || '', customer.lastName || '');
    const allNames = this.nameHash.keys();
    
    for (let nameKey of allNames) {
      if (nameKey !== customerNameKey) {
        const distance = this.levenshteinDistance(customerNameKey, nameKey);
        if (distance <= 2 && distance > 0) { // Similar but not exact
          potentials.push({
            type: 'name',
            customer: this.nameHash.get(nameKey),
            similarity: 1 - (distance / Math.max(customerNameKey.length, nameKey.length))
          });
        }
      }
    }

    return potentials.sort((a, b) => b.similarity - a.similarity);
  }

  // Levenshtein distance for fuzzy string matching
  levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + substitutionCost // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Get statistics
  getStats() {
    return {
      totalEmails: this.emailHash.count,
      totalPhones: this.phoneHash.count,
      totalNames: this.nameHash.count,
      emailLoadFactor: this.emailHash.getLoadFactor(),
      phoneLoadFactor: this.phoneHash.getLoadFactor(),
      nameLoadFactor: this.nameHash.getLoadFactor()
    };
  }
}

module.exports = {
  HashTable,
  DuplicateDetector
};
