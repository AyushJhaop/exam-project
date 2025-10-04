const { HashTable, detectDuplicateCustomers } = require('../algorithms/duplicateDetection');

describe('Hash Table Implementation', () => {
  let hashTable;

  beforeEach(() => {
    hashTable = new HashTable(10);
  });

  describe('Basic Hash Table Operations', () => {
    test('should initialize empty hash table', () => {
      expect(hashTable.size).toBe(0);
      expect(hashTable.buckets.length).toBe(10);
    });

    test('should insert key-value pair', () => {
      hashTable.set('email', 'john@example.com');
      
      expect(hashTable.size).toBe(1);
      expect(hashTable.get('email')).toBe('john@example.com');
    });

    test('should handle multiple insertions', () => {
      const data = {
        'email': 'john@example.com',
        'phone': '1234567890',
        'name': 'John Doe'
      };

      Object.entries(data).forEach(([key, value]) => {
        hashTable.set(key, value);
      });

      expect(hashTable.size).toBe(3);
      
      Object.entries(data).forEach(([key, value]) => {
        expect(hashTable.get(key)).toBe(value);
      });
    });

    test('should update existing key', () => {
      hashTable.set('email', 'old@example.com');
      hashTable.set('email', 'new@example.com');
      
      expect(hashTable.size).toBe(1);
      expect(hashTable.get('email')).toBe('new@example.com');
    });

    test('should return null for non-existent key', () => {
      expect(hashTable.get('nonexistent')).toBeNull();
    });
  });

  describe('Hash Function', () => {
    test('should generate consistent hash for same input', () => {
      const key = 'test@example.com';
      const hash1 = hashTable.hash(key);
      const hash2 = hashTable.hash(key);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toBeGreaterThanOrEqual(0);
      expect(hash1).toBeLessThan(hashTable.buckets.length);
    });

    test('should distribute keys across buckets', () => {
      const keys = [
        'user1@example.com',
        'user2@example.com', 
        'user3@example.com',
        'user4@example.com',
        'user5@example.com'
      ];

      const hashes = keys.map(key => hashTable.hash(key));
      const uniqueHashes = new Set(hashes);
      
      // Should have some distribution (not all same hash)
      expect(uniqueHashes.size).toBeGreaterThan(1);
    });
  });

  describe('Collision Handling', () => {
    test('should handle collisions with chaining', () => {
      // Force collision by using small table
      const smallHashTable = new HashTable(3);
      
      // These will likely collide in a small hash table
      smallHashTable.set('key1', 'value1');
      smallHashTable.set('key2', 'value2');
      smallHashTable.set('key3', 'value3');
      smallHashTable.set('key4', 'value4');

      expect(smallHashTable.get('key1')).toBe('value1');
      expect(smallHashTable.get('key2')).toBe('value2');
      expect(smallHashTable.get('key3')).toBe('value3');
      expect(smallHashTable.get('key4')).toBe('value4');
      expect(smallHashTable.size).toBe(4);
    });
  });

  describe('Delete Operations', () => {
    test('should delete existing key', () => {
      hashTable.set('email', 'john@example.com');
      hashTable.set('phone', '1234567890');
      
      const deleted = hashTable.delete('email');
      
      expect(deleted).toBe(true);
      expect(hashTable.get('email')).toBeNull();
      expect(hashTable.get('phone')).toBe('1234567890');
      expect(hashTable.size).toBe(1);
    });

    test('should return false for non-existent key deletion', () => {
      const deleted = hashTable.delete('nonexistent');
      expect(deleted).toBe(false);
    });
  });
});

describe('Duplicate Customer Detection', () => {
  let customers;

  beforeEach(() => {
    customers = [
      { id: 1, name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '1122334455' }
    ];
  });

  describe('Email Duplicate Detection', () => {
    test('should detect duplicate email', () => {
      const newCustomer = { name: 'John Different', email: 'john@example.com', phone: '9999999999' };
      
      const duplicate = detectDuplicateCustomers(customers, newCustomer);
      
      expect(duplicate.isDuplicate).toBe(true);
      expect(duplicate.matchType).toBe('email');
      expect(duplicate.existingCustomer.id).toBe(1);
    });

    test('should not detect false positive for unique email', () => {
      const newCustomer = { name: 'Alice Cooper', email: 'alice@example.com', phone: '5555555555' };
      
      const duplicate = detectDuplicateCustomers(customers, newCustomer);
      
      expect(duplicate.isDuplicate).toBe(false);
    });
  });

  describe('Phone Duplicate Detection', () => {
    test('should detect duplicate phone number', () => {
      const newCustomer = { name: 'Different Person', email: 'different@example.com', phone: '1234567890' };
      
      const duplicate = detectDuplicateCustomers(customers, newCustomer);
      
      expect(duplicate.isDuplicate).toBe(true);
      expect(duplicate.matchType).toBe('phone');
      expect(duplicate.existingCustomer.id).toBe(1);
    });

    test('should handle phone number formatting variations', () => {
      const formattedCustomers = [
        { id: 1, name: 'John', email: 'john@test.com', phone: '+1 (123) 456-7890' }
      ];
      
      const newCustomer = { name: 'John Alt', email: 'johnalt@test.com', phone: '1234567890' };
      
      const duplicate = detectDuplicateCustomers(formattedCustomers, newCustomer);
      
      expect(duplicate.isDuplicate).toBe(true);
      expect(duplicate.matchType).toBe('phone');
    });
  });

  describe('Name Duplicate Detection', () => {
    test('should detect exact name match', () => {
      const newCustomer = { name: 'John Doe', email: 'johndoe2@example.com', phone: '9999999999' };
      
      const duplicate = detectDuplicateCustomers(customers, newCustomer);
      
      expect(duplicate.isDuplicate).toBe(true);
      expect(duplicate.matchType).toBe('name');
    });

    test('should handle case-insensitive name matching', () => {
      const newCustomer = { name: 'JOHN DOE', email: 'johndoe2@example.com', phone: '9999999999' };
      
      const duplicate = detectDuplicateCustomers(customers, newCustomer);
      
      expect(duplicate.isDuplicate).toBe(true);
      expect(duplicate.matchType).toBe('name');
    });

    test('should handle name variations and whitespace', () => {
      const newCustomer = { name: '  john doe  ', email: 'johndoe2@example.com', phone: '9999999999' };
      
      const duplicate = detectDuplicateCustomers(customers, newCustomer);
      
      expect(duplicate.isDuplicate).toBe(true);
      expect(duplicate.matchType).toBe('name');
    });
  });

  describe('Complex Scenarios', () => {
    test('should prioritize email matches over other types', () => {
      const newCustomer = { 
        name: 'Jane Smith', // Matches customer 2's name
        email: 'john@example.com', // Matches customer 1's email
        phone: '9999999999' 
      };
      
      const duplicate = detectDuplicateCustomers(customers, newCustomer);
      
      expect(duplicate.isDuplicate).toBe(true);
      expect(duplicate.matchType).toBe('email');
      expect(duplicate.existingCustomer.id).toBe(1); // Should match John, not Jane
    });

    test('should handle empty customer list', () => {
      const newCustomer = { name: 'New Customer', email: 'new@example.com', phone: '1111111111' };
      
      const duplicate = detectDuplicateCustomers([], newCustomer);
      
      expect(duplicate.isDuplicate).toBe(false);
    });

    test('should handle missing fields gracefully', () => {
      const newCustomer = { name: 'Incomplete Customer' }; // Missing email and phone
      
      const duplicate = detectDuplicateCustomers(customers, newCustomer);
      
      expect(duplicate.isDuplicate).toBe(false);
    });

    test('should detect multiple potential matches', () => {
      const complexCustomers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '1111111111' },
        { id: 2, name: 'John Smith', email: 'johns@example.com', phone: '2222222222' }
      ];
      
      // This customer has similar name to both
      const newCustomer = { name: 'John Doe', email: 'newjohn@example.com', phone: '3333333333' };
      
      const duplicate = detectDuplicateCustomers(complexCustomers, newCustomer);
      
      expect(duplicate.isDuplicate).toBe(true);
      expect(duplicate.matchType).toBe('name');
      expect(duplicate.existingCustomer.id).toBe(1); // Should match exact name
    });
  });

  describe('Performance Tests', () => {
    test('should handle large customer database efficiently', () => {
      // Create large customer dataset
      const largeCustomerSet = [];
      for (let i = 0; i < 1000; i++) {
        largeCustomerSet.push({
          id: i,
          name: `Customer ${i}`,
          email: `customer${i}@example.com`,
          phone: `${1000000000 + i}`
        });
      }

      const newCustomer = { 
        name: 'Customer 500', 
        email: 'newcustomer@example.com', 
        phone: '9999999999' 
      };

      const startTime = performance.now();
      const duplicate = detectDuplicateCustomers(largeCustomerSet, newCustomer);
      const endTime = performance.now();

      expect(duplicate.isDuplicate).toBe(true);
      expect(duplicate.matchType).toBe('name');
      expect(endTime - startTime).toBeLessThan(10); // Should complete in less than 10ms
    });

    test('should handle frequent duplicate checks efficiently', () => {
      const startTime = performance.now();

      // Perform 100 duplicate checks
      for (let i = 0; i < 100; i++) {
        const testCustomer = {
          name: `Test Customer ${i}`,
          email: `test${i}@example.com`,
          phone: `${2000000000 + i}`
        };
        detectDuplicateCustomers(customers, testCustomer);
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50); // Should complete in less than 50ms
    });
  });

  describe('Edge Cases', () => {
    test('should handle null/undefined inputs', () => {
      expect(() => detectDuplicateCustomers(null, {})).not.toThrow();
      expect(() => detectDuplicateCustomers([], null)).not.toThrow();
      expect(() => detectDuplicateCustomers(customers, undefined)).not.toThrow();
    });

    test('should handle malformed customer data', () => {
      const malformedCustomers = [
        null,
        undefined,
        {},
        { id: 1 }, // Missing required fields
        { name: '', email: '', phone: '' } // Empty fields
      ];

      const newCustomer = { name: 'Valid Customer', email: 'valid@example.com', phone: '1234567890' };

      expect(() => detectDuplicateCustomers(malformedCustomers, newCustomer)).not.toThrow();
    });
  });
});
