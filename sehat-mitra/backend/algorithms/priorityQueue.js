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
 * Advanced Lead Qualification Engine
 * Automatically scores and prioritizes leads based on multiple factors
 */
class LeadQualificationEngine {
  constructor() {
    this.leadQueue = new PriorityQueue((a, b) => b.priority - a.priority);
    this.conversionFactors = {
      // Patient lead scoring factors
      patient: {
        urgentConditions: ['chest pain', 'breathing', 'emergency', 'urgent', 'severe'],
        chronicConditions: ['diabetes', 'hypertension', 'heart', 'chronic'],
        ageRisk: ['elderly', 'senior', 'age'],
        previousPatient: 3, // Bonus points for returning patients
      },
      // Doctor lead scoring factors
      doctor: {
        highDemandSpecialties: ['cardiology', 'psychiatry', 'dermatology'],
        experienceKeywords: ['years', 'experience', 'specialist', 'consultant'],
        qualifications: ['MD', 'MBBS', 'MS', 'DM', 'PhD'],
      }
    };
  }

  /**
   * Calculate lead score based on multiple factors
   */
  calculateLeadScore(lead) {
    let score = 0;
    
    // Base score from source
    const sourceScores = {
      'referral': 8,
      'social_media': 6,
      'advertisement': 5,
      'website': 4
    };
    score += sourceScores[lead.source] || 4;

    // Time-based urgency (newer leads get higher priority)
    const hoursSinceCreation = (Date.now() - new Date(lead.createdAt)) / (1000 * 60 * 60);
    if (hoursSinceCreation < 1) score += 3; // Very recent
    else if (hoursSinceCreation < 24) score += 2; // Recent
    else if (hoursSinceCreation < 72) score += 1; // Somewhat recent

    // Lead type specific scoring
    if (lead.leadType === 'patient') {
      score += this.scorePatientLead(lead);
    } else if (lead.leadType === 'doctor') {
      score += this.scoreDoctorLead(lead);
    }

    // Contact information completeness
    if (lead.email && lead.phone) score += 1;
    
    // Previous interactions boost
    if (lead.interactions && lead.interactions.length > 0) {
      score += Math.min(lead.interactions.length, 3); // Max 3 bonus points
    }

    return Math.min(Math.max(score, 1), 10); // Ensure score is between 1-10
  }

  /**
   * Score patient leads based on medical urgency and engagement
   */
  scorePatientLead(lead) {
    let patientScore = 0;
    const condition = (lead.medicalCondition || '').toLowerCase();

    // Check for urgent conditions
    if (this.conversionFactors.patient.urgentConditions.some(keyword => 
      condition.includes(keyword))) {
      patientScore += 4;
    }

    // Check for chronic conditions (high lifetime value)
    if (this.conversionFactors.patient.chronicConditions.some(keyword => 
      condition.includes(keyword))) {
      patientScore += 2;
    }

    // Age-related risk factors
    if (this.conversionFactors.patient.ageRisk.some(keyword => 
      condition.includes(keyword))) {
      patientScore += 2;
    }

    // Specific symptoms mentioned
    if (condition && condition.length > 10) {
      patientScore += 1; // Detailed description shows engagement
    }

    return patientScore;
  }

  /**
   * Score doctor leads based on specialty demand and qualifications
   */
  scoreDoctorLead(lead) {
    let doctorScore = 0;
    const specialization = (lead.specialization || '').toLowerCase();

    // High-demand specialties
    if (this.conversionFactors.doctor.highDemandSpecialties.some(specialty => 
      specialization.includes(specialty))) {
      doctorScore += 3;
    }

    // Experience indicators
    if (this.conversionFactors.doctor.experienceKeywords.some(keyword => 
      (lead.notes && lead.notes.some(note => note.content.toLowerCase().includes(keyword))))) {
      doctorScore += 2;
    }

    // Qualification keywords in notes
    if (lead.notes && lead.notes.some(note => 
      this.conversionFactors.doctor.qualifications.some(qual => 
        note.content.includes(qual)))) {
      doctorScore += 2;
    }

    return doctorScore;
  }

  /**
   * Add lead to qualification queue
   */
  addLead(leadData) {
    const score = this.calculateLeadScore(leadData);
    const qualifiedLead = {
      ...leadData,
      priority: score,
      qualificationDate: new Date(),
      nextFollowUpSuggested: this.suggestFollowUpTime(score, leadData.leadType)
    };

    this.leadQueue.enqueue(qualifiedLead);
    return qualifiedLead;
  }

  /**
   * Suggest optimal follow-up time based on lead score and type
   */
  suggestFollowUpTime(score, leadType) {
    const now = new Date();
    
    if (score >= 8) {
      // High priority - follow up within 30 minutes
      return new Date(now.getTime() + 30 * 60 * 1000);
    } else if (score >= 6) {
      // Medium-high priority - follow up within 2 hours
      return new Date(now.getTime() + 2 * 60 * 60 * 1000);
    } else if (score >= 4) {
      // Medium priority - follow up within 4 hours
      return new Date(now.getTime() + 4 * 60 * 60 * 1000);
    } else {
      // Low priority - follow up within 24 hours
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Get next lead to process
   */
  getNextLead() {
    return this.leadQueue.dequeue();
  }

  /**
   * Get current queue status
   */
  getQueueStatus() {
    const leads = [...this.leadQueue.heap];
    return {
      totalLeads: leads.length,
      highPriorityCount: leads.filter(l => l.priority >= 8).length,
      mediumPriorityCount: leads.filter(l => l.priority >= 6 && l.priority < 8).length,
      lowPriorityCount: leads.filter(l => l.priority < 6).length,
      averageScore: leads.length > 0 ? 
        (leads.reduce((sum, l) => sum + l.priority, 0) / leads.length).toFixed(1) : 0
    };
  }

  /**
   * Re-score existing leads (useful for periodic updates)
   */
  rescoreLeads() {
    const allLeads = [];
    while (!this.leadQueue.isEmpty()) {
      allLeads.push(this.leadQueue.dequeue());
    }

    allLeads.forEach(lead => {
      const newScore = this.calculateLeadScore(lead);
      lead.priority = newScore;
      lead.nextFollowUpSuggested = this.suggestFollowUpTime(newScore, lead.leadType);
      this.leadQueue.enqueue(lead);
    });

    return this.getQueueStatus();
  }
}

module.exports = {
  PriorityQueue,
  LeadQualificationEngine
};
