/**
 * Balanced BST for efficient doctor search and recommendations
 */
class DoctorBST {
  constructor() {
    this.root = null;
  }

  // Node structure
  createNode(doctor) {
    return {
      doctor,
      left: null,
      right: null,
      height: 1
    };
  }

  // Get height of node
  getHeight(node) {
    return node ? node.height : 0;
  }

  // Get balance factor
  getBalance(node) {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  // Update height
  updateHeight(node) {
    if (node) {
      node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }
  }

  // Right rotation
  rotateRight(y) {
    const x = y.left;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    this.updateHeight(y);
    this.updateHeight(x);

    return x;
  }

  // Left rotation
  rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    this.updateHeight(x);
    this.updateHeight(y);

    return y;
  }

  // Insert doctor
  insert(doctor) {
    this.root = this._insert(this.root, doctor);
  }

  _insert(node, doctor) {
    // Normal BST insertion
    if (!node) {
      return this.createNode(doctor);
    }

    // Compare by rating (primary) and experience (secondary)
    const compareValue = this.compareDoctor(doctor, node.doctor);
    
    if (compareValue < 0) {
      node.left = this._insert(node.left, doctor);
    } else if (compareValue > 0) {
      node.right = this._insert(node.right, doctor);
    } else {
      return node; // Duplicate
    }

    // Update height
    this.updateHeight(node);

    // Get balance
    const balance = this.getBalance(node);

    // Left Left Case
    if (balance > 1 && this.compareDoctor(doctor, node.left.doctor) < 0) {
      return this.rotateRight(node);
    }

    // Right Right Case
    if (balance < -1 && this.compareDoctor(doctor, node.right.doctor) > 0) {
      return this.rotateLeft(node);
    }

    // Left Right Case
    if (balance > 1 && this.compareDoctor(doctor, node.left.doctor) > 0) {
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }

    // Right Left Case
    if (balance < -1 && this.compareDoctor(doctor, node.right.doctor) < 0) {
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    return node;
  }

  // Compare doctors for BST ordering
  compareDoctor(doc1, doc2) {
    const rating1 = doc1.doctorInfo?.rating?.average || 0;
    const rating2 = doc2.doctorInfo?.rating?.average || 0;
    
    if (rating1 !== rating2) {
      return rating2 - rating1; // Higher rating first
    }
    
    const exp1 = doc1.doctorInfo?.experience || 0;
    const exp2 = doc2.doctorInfo?.experience || 0;
    
    return exp2 - exp1; // Higher experience first
  }

  // Search by specialization and rating range
  searchBySpecialization(specialization, minRating = 0) {
    const results = [];
    this._searchBySpecialization(this.root, specialization, minRating, results);
    return results;
  }

  _searchBySpecialization(node, specialization, minRating, results) {
    if (!node) return;

    const doctor = node.doctor;
    const hasSpecialization = doctor.doctorInfo?.specialization?.includes(specialization);
    const rating = doctor.doctorInfo?.rating?.average || 0;

    if (hasSpecialization && rating >= minRating) {
      results.push(doctor);
    }

    this._searchBySpecialization(node.left, specialization, minRating, results);
    this._searchBySpecialization(node.right, specialization, minRating, results);
  }

  // Get top N doctors by rating
  getTopDoctors(n = 10) {
    const results = [];
    this._inorderTraversal(this.root, results);
    return results.slice(0, n);
  }

  _inorderTraversal(node, results) {
    if (!node || results.length >= 10) return;

    // Visit right subtree first (higher ratings)
    this._inorderTraversal(node.right, results);
    
    if (results.length < 10) {
      results.push(node.doctor);
    }
    
    this._inorderTraversal(node.left, results);
  }
}

/**
 * Appointment matching algorithm using multiple criteria
 */
class AppointmentMatcher {
  constructor() {
    this.doctorBST = new DoctorBST();
  }

  // Add doctor to search tree
  addDoctor(doctor) {
    this.doctorBST.insert(doctor);
  }

  // Find best doctor matches for appointment request
  findBestMatches(appointmentRequest, availableDoctors) {
    const {
      specialization,
      preferredTime,
      urgency,
      maxFee,
      location,
      patientAge,
      symptoms
    } = appointmentRequest;

    // Score each doctor based on multiple criteria
    const scoredDoctors = availableDoctors.map(doctor => ({
      doctor,
      score: this.calculateMatchScore(doctor, appointmentRequest)
    }));

    // Sort by score (descending)
    scoredDoctors.sort((a, b) => b.score - a.score);

    return scoredDoctors.slice(0, 5); // Top 5 matches
  }

  // Calculate match score using weighted criteria
  calculateMatchScore(doctor, request) {
    let score = 0;
    const weights = {
      specialization: 0.3,
      rating: 0.25,
      experience: 0.15,
      availability: 0.15,
      fee: 0.1,
      location: 0.05
    };

    // Specialization match
    if (doctor.doctorInfo?.specialization?.includes(request.specialization)) {
      score += weights.specialization * 100;
    }

    // Rating score
    const rating = doctor.doctorInfo?.rating?.average || 0;
    score += weights.rating * (rating * 20); // Scale to 100

    // Experience score
    const experience = doctor.doctorInfo?.experience || 0;
    score += weights.experience * Math.min(experience * 5, 100);

    // Availability score (check if doctor has slots)
    const availabilityScore = this.checkAvailability(doctor, request.preferredTime);
    score += weights.availability * availabilityScore;

    // Fee score (inverse - lower fee is better)
    const doctorFee = doctor.doctorInfo?.consultationFee || 0;
    const maxFee = request.maxFee || doctorFee;
    if (doctorFee <= maxFee) {
      score += weights.fee * ((maxFee - doctorFee) / maxFee) * 100;
    }

    return Math.round(score * 100) / 100;
  }

  // Check doctor availability for requested time
  checkAvailability(doctor, requestedTime) {
    if (!doctor.doctorInfo?.availableSlots) return 0;

    const requestDate = new Date(requestedTime);
    const dayName = requestDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const requestHour = requestDate.getHours();
    const requestMinute = requestDate.getMinutes();
    const requestTimeMinutes = requestHour * 60 + requestMinute;

    const daySlots = doctor.doctorInfo.availableSlots.filter(slot => 
      slot.day === dayName
    );

    for (let slot of daySlots) {
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);
      const startTimeMinutes = startHour * 60 + startMin;
      const endTimeMinutes = endHour * 60 + endMin;

      if (requestTimeMinutes >= startTimeMinutes && requestTimeMinutes < endTimeMinutes) {
        return 100; // Perfect match
      }
    }

    return 20; // Doctor available on different times
  }

  // Find optimal appointment slots using sliding window
  findOptimalSlots(doctorId, date, duration = 30) {
    // Implementation would check existing appointments and find gaps
    // This is a simplified version
    const slots = [];
    const workingHours = {
      start: 9 * 60, // 9 AM in minutes
      end: 17 * 60   // 5 PM in minutes
    };

    for (let time = workingHours.start; time < workingHours.end - duration; time += 30) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      slots.push({
        startTime: timeStr,
        endTime: `${Math.floor((time + duration) / 60).toString().padStart(2, '0')}:${((time + duration) % 60).toString().padStart(2, '0')}`,
        available: true // Would check against existing appointments
      });
    }

    return slots;
  }
}

module.exports = {
  DoctorBST,
  AppointmentMatcher
};
