const PriorityQueue = require('../algorithms/priorityQueue');

describe('PriorityQueue Data Structure', () => {
  let pq;

  beforeEach(() => {
    pq = new PriorityQueue();
  });

  describe('Initialization', () => {
    test('should initialize empty priority queue', () => {
      expect(pq.size()).toBe(0);
      expect(pq.isEmpty()).toBe(true);
    });
  });

  describe('Insert Operations', () => {
    test('should insert single element', () => {
      const lead = { id: 1, name: 'John Doe', score: 85 };
      pq.insert(lead, 85);
      
      expect(pq.size()).toBe(1);
      expect(pq.isEmpty()).toBe(false);
    });

    test('should insert multiple elements and maintain heap property', () => {
      const leads = [
        { id: 1, name: 'John', score: 85 },
        { id: 2, name: 'Jane', score: 95 },
        { id: 3, name: 'Bob', score: 75 },
        { id: 4, name: 'Alice', score: 90 }
      ];

      leads.forEach(lead => pq.insert(lead, lead.score));
      
      expect(pq.size()).toBe(4);
      
      // Should extract in priority order (highest first)
      expect(pq.extractMax().score).toBe(95);
      expect(pq.extractMax().score).toBe(90);
      expect(pq.extractMax().score).toBe(85);
      expect(pq.extractMax().score).toBe(75);
    });

    test('should handle duplicate priorities', () => {
      pq.insert({ id: 1, score: 80 }, 80);
      pq.insert({ id: 2, score: 80 }, 80);
      pq.insert({ id: 3, score: 80 }, 80);
      
      expect(pq.size()).toBe(3);
      
      const first = pq.extractMax();
      const second = pq.extractMax();
      const third = pq.extractMax();
      
      expect(first.score).toBe(80);
      expect(second.score).toBe(80);
      expect(third.score).toBe(80);
    });
  });

  describe('Extract Operations', () => {
    test('should extract maximum element', () => {
      const leads = [
        { id: 1, score: 70 },
        { id: 2, score: 90 },
        { id: 3, score: 80 }
      ];
      
      leads.forEach(lead => pq.insert(lead, lead.score));
      
      const max = pq.extractMax();
      expect(max.score).toBe(90);
      expect(pq.size()).toBe(2);
    });

    test('should return null when extracting from empty queue', () => {
      expect(pq.extractMax()).toBeNull();
    });

    test('should maintain heap property after multiple extractions', () => {
      const scores = [45, 78, 23, 89, 56, 34, 67, 91, 12, 88];
      scores.forEach(score => pq.insert({ score }, score));
      
      const extracted = [];
      while (!pq.isEmpty()) {
        extracted.push(pq.extractMax().score);
      }
      
      // Should be in descending order
      for (let i = 1; i < extracted.length; i++) {
        expect(extracted[i-1]).toBeGreaterThanOrEqual(extracted[i]);
      }
    });
  });

  describe('Peek Operations', () => {
    test('should peek at maximum without removing', () => {
      pq.insert({ id: 1, score: 85 }, 85);
      pq.insert({ id: 2, score: 75 }, 75);
      
      const max = pq.peek();
      expect(max.score).toBe(85);
      expect(pq.size()).toBe(2); // Size should remain unchanged
    });

    test('should return null when peeking empty queue', () => {
      expect(pq.peek()).toBeNull();
    });
  });

  describe('Lead Qualification Scenarios', () => {
    test('should prioritize leads based on qualification score', () => {
      const leads = [
        { id: 1, name: 'Low Interest', email: 'low@test.com', phone: '1111111111', score: 35 },
        { id: 2, name: 'High Interest', email: 'high@test.com', phone: '2222222222', score: 95 },
        { id: 3, name: 'Medium Interest', email: 'med@test.com', phone: '3333333333', score: 65 },
        { id: 4, name: 'Critical Lead', email: 'crit@test.com', phone: '4444444444', score: 100 }
      ];

      leads.forEach(lead => pq.insert(lead, lead.score));
      
      // Should process critical leads first
      expect(pq.extractMax().name).toBe('Critical Lead');
      expect(pq.extractMax().name).toBe('High Interest');
      expect(pq.extractMax().name).toBe('Medium Interest');
      expect(pq.extractMax().name).toBe('Low Interest');
    });

    test('should handle real-time lead insertion and processing', () => {
      // Simulate real-time lead processing
      pq.insert({ id: 1, score: 60 }, 60);
      expect(pq.peek().score).toBe(60);
      
      pq.insert({ id: 2, score: 80 }, 80);
      expect(pq.peek().score).toBe(80);
      
      pq.insert({ id: 3, score: 70 }, 70);
      expect(pq.peek().score).toBe(80);
      
      // Process highest priority
      const processed = pq.extractMax();
      expect(processed.score).toBe(80);
      expect(pq.peek().score).toBe(70);
    });
  });

  describe('Performance Tests', () => {
    test('should handle large number of insertions efficiently', () => {
      const startTime = performance.now();
      
      // Insert 1000 random leads
      for (let i = 0; i < 1000; i++) {
        const score = Math.floor(Math.random() * 100);
        pq.insert({ id: i, score }, score);
      }
      
      const endTime = performance.now();
      const insertTime = endTime - startTime;
      
      expect(pq.size()).toBe(1000);
      expect(insertTime).toBeLessThan(100); // Should complete in less than 100ms
    });

    test('should handle large number of extractions efficiently', () => {
      // Insert 500 elements
      for (let i = 0; i < 500; i++) {
        pq.insert({ id: i, score: Math.floor(Math.random() * 100) }, Math.floor(Math.random() * 100));
      }
      
      const startTime = performance.now();
      
      // Extract all elements
      const extracted = [];
      while (!pq.isEmpty()) {
        extracted.push(pq.extractMax());
      }
      
      const endTime = performance.now();
      const extractTime = endTime - startTime;
      
      expect(extracted.length).toBe(500);
      expect(extractTime).toBeLessThan(50); // Should complete in less than 50ms
    });
  });

  describe('Edge Cases', () => {
    test('should handle negative priorities', () => {
      pq.insert({ id: 1, score: -10 }, -10);
      pq.insert({ id: 2, score: -5 }, -5);
      pq.insert({ id: 3, score: 0 }, 0);
      
      expect(pq.extractMax().score).toBe(0);
      expect(pq.extractMax().score).toBe(-5);
      expect(pq.extractMax().score).toBe(-10);
    });

    test('should handle zero priority', () => {
      pq.insert({ id: 1, score: 0 }, 0);
      expect(pq.peek().score).toBe(0);
      expect(pq.extractMax().score).toBe(0);
    });

    test('should handle single element operations', () => {
      pq.insert({ id: 1, score: 50 }, 50);
      
      expect(pq.size()).toBe(1);
      expect(pq.peek().score).toBe(50);
      expect(pq.extractMax().score).toBe(50);
      expect(pq.isEmpty()).toBe(true);
    });
  });
});
