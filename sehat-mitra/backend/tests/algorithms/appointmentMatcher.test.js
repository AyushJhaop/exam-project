const { BalancedBST, TreeNode } = require('../algorithms/appointmentMatcher');

describe('Balanced BST (AVL Tree) Implementation', () => {
  let bst;

  beforeEach(() => {
    bst = new BalancedBST();
  });

  describe('Basic Tree Operations', () => {
    test('should initialize empty BST', () => {
      expect(bst.root).toBeNull();
      expect(bst.size).toBe(0);
    });

    test('should insert single doctor', () => {
      const doctor = {
        id: 1,
        name: 'Dr. Smith',
        specialization: 'Cardiology',
        rating: 4.5,
        experience: 10
      };

      bst.insert(doctor, 4.5); // Using rating as key
      
      expect(bst.root).not.toBeNull();
      expect(bst.root.data.name).toBe('Dr. Smith');
      expect(bst.size).toBe(1);
    });

    test('should insert multiple doctors and maintain BST property', () => {
      const doctors = [
        { id: 1, name: 'Dr. Smith', rating: 4.5 },
        { id: 2, name: 'Dr. Jones', rating: 4.8 },
        { id: 3, name: 'Dr. Brown', rating: 4.2 },
        { id: 4, name: 'Dr. Wilson', rating: 4.9 },
        { id: 5, name: 'Dr. Davis', rating: 4.0 }
      ];

      doctors.forEach(doc => bst.insert(doc, doc.rating));
      
      expect(bst.size).toBe(5);
      
      // Verify BST property through in-order traversal
      const inOrder = bst.inOrderTraversal();
      for (let i = 1; i < inOrder.length; i++) {
        expect(inOrder[i-1].rating).toBeLessThanOrEqual(inOrder[i].rating);
      }
    });
  });

  describe('Search Operations', () => {
    beforeEach(() => {
      const doctors = [
        { id: 1, name: 'Dr. Smith', rating: 4.5, specialization: 'Cardiology' },
        { id: 2, name: 'Dr. Jones', rating: 4.8, specialization: 'Neurology' },
        { id: 3, name: 'Dr. Brown', rating: 4.2, specialization: 'Orthopedics' },
        { id: 4, name: 'Dr. Wilson', rating: 4.9, specialization: 'Dermatology' },
        { id: 5, name: 'Dr. Davis', rating: 4.0, specialization: 'Pediatrics' }
      ];
      
      doctors.forEach(doc => bst.insert(doc, doc.rating));
    });

    test('should find doctor by exact rating', () => {
      const result = bst.search(4.8);
      expect(result).not.toBeNull();
      expect(result.name).toBe('Dr. Jones');
    });

    test('should return null for non-existent rating', () => {
      const result = bst.search(3.5);
      expect(result).toBeNull();
    });

    test('should find doctors within rating range', () => {
      const doctors = bst.searchRange(4.2, 4.8);
      expect(doctors.length).toBe(3); // Dr. Brown (4.2), Dr. Smith (4.5), Dr. Jones (4.8)
      
      doctors.forEach(doc => {
        expect(doc.rating).toBeGreaterThanOrEqual(4.2);
        expect(doc.rating).toBeLessThanOrEqual(4.8);
      });
    });

    test('should find doctors with minimum rating', () => {
      const highRatedDoctors = bst.searchRange(4.5, 5.0);
      expect(highRatedDoctors.length).toBe(3); // Smith (4.5), Jones (4.8), Wilson (4.9)
      
      highRatedDoctors.forEach(doc => {
        expect(doc.rating).toBeGreaterThanOrEqual(4.5);
      });
    });
  });

  describe('AVL Tree Balance', () => {
    test('should maintain balance with sequential insertions', () => {
      // Insert in ascending order (worst case for regular BST)
      for (let i = 1; i <= 10; i++) {
        bst.insert({ id: i, name: `Dr. ${i}`, rating: i * 0.5 }, i * 0.5);
      }

      // Tree should remain balanced (height difference <= 1)
      expect(bst.isBalanced()).toBe(true);
      expect(bst.getHeight()).toBeLessThanOrEqual(4); // log2(10) ≈ 3.32, so height should be ≤ 4
    });

    test('should perform left rotation', () => {
      // Insert nodes that will cause left rotation
      bst.insert({ id: 1, rating: 1.0 }, 1.0);
      bst.insert({ id: 2, rating: 2.0 }, 2.0);
      bst.insert({ id: 3, rating: 3.0 }, 3.0);

      expect(bst.isBalanced()).toBe(true);
      expect(bst.root.key).toBe(2.0); // Should become root after rotation
    });

    test('should perform right rotation', () => {
      // Insert nodes that will cause right rotation
      bst.insert({ id: 3, rating: 3.0 }, 3.0);
      bst.insert({ id: 2, rating: 2.0 }, 2.0);
      bst.insert({ id: 1, rating: 1.0 }, 1.0);

      expect(bst.isBalanced()).toBe(true);
      expect(bst.root.key).toBe(2.0); // Should become root after rotation
    });

    test('should handle complex rotations', () => {
      const ratings = [4.5, 4.8, 4.2, 4.9, 4.0, 4.7, 4.3, 4.6, 4.1, 4.4];
      
      ratings.forEach((rating, index) => {
        bst.insert({ id: index, rating }, rating);
      });

      expect(bst.isBalanced()).toBe(true);
      expect(bst.size).toBe(10);
    });
  });

  describe('Doctor Matching Scenarios', () => {
    beforeEach(() => {
      const doctors = [
        { id: 1, name: 'Dr. Smith', rating: 4.5, specialization: 'Cardiology', availability: ['9AM', '10AM'] },
        { id: 2, name: 'Dr. Jones', rating: 4.8, specialization: 'Neurology', availability: ['2PM', '3PM'] },
        { id: 3, name: 'Dr. Brown', rating: 4.2, specialization: 'Orthopedics', availability: ['11AM', '12PM'] },
        { id: 4, name: 'Dr. Wilson', rating: 4.9, specialization: 'Dermatology', availability: ['4PM', '5PM'] },
        { id: 5, name: 'Dr. Davis', rating: 4.0, specialization: 'Pediatrics', availability: ['1PM', '2PM'] }
      ];
      
      doctors.forEach(doc => bst.insert(doc, doc.rating));
    });

    test('should find best doctors for appointment matching', () => {
      // Find top-rated doctors (rating >= 4.5)
      const topDoctors = bst.searchRange(4.5, 5.0);
      
      expect(topDoctors.length).toBe(3);
      topDoctors.forEach(doc => {
        expect(doc.rating).toBeGreaterThanOrEqual(4.5);
      });
      
      // Should be sorted by rating
      expect(topDoctors[0].rating).toBeLessThanOrEqual(topDoctors[1].rating);
      expect(topDoctors[1].rating).toBeLessThanOrEqual(topDoctors[2].rating);
    });

    test('should find doctors by specialization and rating', () => {
      const cardiologists = bst.inOrderTraversal()
        .filter(doc => doc.specialization === 'Cardiology');
      
      expect(cardiologists.length).toBe(1);
      expect(cardiologists[0].name).toBe('Dr. Smith');
    });

    test('should find available doctors for time slot', () => {
      const morningDoctors = bst.inOrderTraversal()
        .filter(doc => doc.availability.some(slot => slot.includes('AM')));
      
      expect(morningDoctors.length).toBe(2); // Dr. Smith and Dr. Brown
    });
  });

  describe('Performance Tests', () => {
    test('should handle large number of doctors efficiently', () => {
      const startTime = performance.now();
      
      // Insert 1000 doctors
      for (let i = 0; i < 1000; i++) {
        const rating = 3.0 + (Math.random() * 2); // Random rating between 3.0 and 5.0
        bst.insert({
          id: i,
          name: `Dr. ${i}`,
          rating: parseFloat(rating.toFixed(1))
        }, parseFloat(rating.toFixed(1)));
      }
      
      const endTime = performance.now();
      const insertTime = endTime - startTime;
      
      expect(bst.size).toBe(1000);
      expect(bst.isBalanced()).toBe(true);
      expect(insertTime).toBeLessThan(100); // Should complete in less than 100ms
    });

    test('should perform searches efficiently on large dataset', () => {
      // Insert 500 doctors
      for (let i = 0; i < 500; i++) {
        const rating = 3.0 + (Math.random() * 2);
        bst.insert({
          id: i,
          name: `Dr. ${i}`,
          rating: parseFloat(rating.toFixed(1))
        }, parseFloat(rating.toFixed(1)));
      }
      
      const startTime = performance.now();
      
      // Perform 100 searches
      for (let i = 0; i < 100; i++) {
        const searchRating = 3.0 + (Math.random() * 2);
        bst.search(parseFloat(searchRating.toFixed(1)));
      }
      
      const endTime = performance.now();
      const searchTime = endTime - startTime;
      
      expect(searchTime).toBeLessThan(50); // Should complete in less than 50ms
    });
  });

  describe('Edge Cases', () => {
    test('should handle duplicate ratings', () => {
      bst.insert({ id: 1, name: 'Dr. A', rating: 4.5 }, 4.5);
      bst.insert({ id: 2, name: 'Dr. B', rating: 4.5 }, 4.5);
      
      // Tree should handle duplicates (implementation dependent)
      expect(bst.size).toBeGreaterThan(0);
    });

    test('should handle empty tree operations', () => {
      expect(bst.search(4.5)).toBeNull();
      expect(bst.searchRange(4.0, 5.0)).toEqual([]);
      expect(bst.inOrderTraversal()).toEqual([]);
    });

    test('should handle single node tree', () => {
      bst.insert({ id: 1, name: 'Dr. Single', rating: 4.5 }, 4.5);
      
      expect(bst.search(4.5)).not.toBeNull();
      expect(bst.searchRange(4.0, 5.0).length).toBe(1);
      expect(bst.isBalanced()).toBe(true);
    });
  });
});
