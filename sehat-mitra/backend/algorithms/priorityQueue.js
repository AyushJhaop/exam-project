/**
 * Priority Queue implementation for lead qualification
 * Uses Min-Heap for efficient priority-based processing
 */
class PriorityQueue {
  constructor(compareFn) {
    this.heap = [];
    this.compare = compareFn || ((a, b) => a.priority - b.priority);
  }

  // Get parent index
  parent(index) {
    return Math.floor((index - 1) / 2);
  }

  // Get left child index
  leftChild(index) {
    return 2 * index + 1;
  }

  // Get right child index
  rightChild(index) {
    return 2 * index + 2;
  }

  // Swap two elements
  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // Insert element with priority
  enqueue(element) {
    this.heap.push(element);
    this.heapifyUp(this.heap.length - 1);
  }

  // Remove and return highest priority element
  dequeue() {
    if (this.isEmpty()) return null;

    const root = this.heap[0];
    const lastElement = this.heap.pop();

    if (!this.isEmpty()) {
      this.heap[0] = lastElement;
      this.heapifyDown(0);
    }

    return root;
  }

  // Check if queue is empty
  isEmpty() {
    return this.heap.length === 0;
  }

  // Get size
  size() {
    return this.heap.length;
  }

  // Peek at highest priority element
  peek() {
    return this.isEmpty() ? null : this.heap[0];
  }

  // Heapify up (for insertion)
  heapifyUp(index) {
    while (index > 0) {
      const parentIndex = this.parent(index);
      if (this.compare(this.heap[index], this.heap[parentIndex]) >= 0) break;

      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  // Heapify down (for deletion)
  heapifyDown(index) {
    while (this.leftChild(index) < this.heap.length) {
      const leftIndex = this.leftChild(index);
      const rightIndex = this.rightChild(index);
      let minIndex = leftIndex;

      if (
        rightIndex < this.heap.length &&
        this.compare(this.heap[rightIndex], this.heap[leftIndex]) < 0
      ) {
        minIndex = rightIndex;
      }

      if (this.compare(this.heap[index], this.heap[minIndex]) <= 0) break;

      this.swap(index, minIndex);
      index = minIndex;
    }
  }

  // Get all elements (for debugging)
  getAll() {
    return [...this.heap];
  }
}

/**
 * Lead qualification engine using Priority Queue
 */
class LeadQualificationEngine {
  constructor() {
    this.leadQueue = new PriorityQueue((a, b) => {
      // Higher priority first (negative comparison for max heap behavior)
      return b.priority - a.priority;
    });
  }

  // Calculate lead priority score
  calculatePriority(lead) {
    let priority = 0;

    // Base priority by lead type
    if (lead.leadType === 'doctor') priority += 3;
    if (lead.leadType === 'patient') priority += 2;

    // Source priority
    const sourcePriority = {
      referral: 4,
      advertisement: 3,
      website: 2,
      social_media: 1
    };
    priority += sourcePriority[lead.source] || 0;

    // Urgency for patients
    if (lead.medicalCondition) {
      const urgentConditions = ['emergency', 'chest pain', 'breathing difficulty', 'severe pain'];
      if (urgentConditions.some(condition => 
        lead.medicalCondition.toLowerCase().includes(condition))) {
        priority += 5;
      }
    }

    // Specialization demand for doctors
    if (lead.specialization) {
      const highDemandSpecs = ['cardiology', 'neurology', 'oncology', 'psychiatry'];
      if (highDemandSpecs.includes(lead.specialization.toLowerCase())) {
        priority += 3;
      }
    }

    // Interaction history
    if (lead.interactions && lead.interactions.length > 0) {
      priority += Math.min(lead.interactions.length * 0.5, 2);
    }

    return Math.min(priority, 10); // Cap at 10
  }

  // Add lead to qualification queue
  addLead(lead) {
    const enrichedLead = {
      ...lead,
      priority: this.calculatePriority(lead),
      addedAt: new Date()
    };

    this.leadQueue.enqueue(enrichedLead);
    return enrichedLead;
  }

  // Get next lead to process
  getNextLead() {
    return this.leadQueue.dequeue();
  }

  // Get queue status
  getQueueStatus() {
    return {
      totalLeads: this.leadQueue.size(),
      topPriorityLead: this.leadQueue.peek(),
      allLeads: this.leadQueue.getAll().sort((a, b) => b.priority - a.priority)
    };
  }

  // Process multiple leads and return sorted by priority
  processLeads(leads) {
    leads.forEach(lead => this.addLead(lead));
    
    const processed = [];
    while (!this.leadQueue.isEmpty()) {
      processed.push(this.leadQueue.dequeue());
    }
    
    return processed;
  }
}

module.exports = {
  PriorityQueue,
  LeadQualificationEngine
};
