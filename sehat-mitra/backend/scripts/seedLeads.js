const mongoose = require('mongoose');
const Lead = require('../models/Lead');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sehat-mitra', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleLeads = [
  // Patient Leads
  {
    firstName: "Rahul",
    lastName: "Sharma",
    email: "rahul.sharma@email.com",
    phone: "+91-9876543210",
    leadType: "patient",
    medicalCondition: "Diabetes Management",
    source: "website",
    priority: 8,
    stage: "qualified",
    notes: [{
      content: "Patient looking for diabetes specialist. Has family history. Interested in telemedicine consultation.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    }],
    interactions: [{
      type: "call",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      outcome: "Positive - scheduled consultation",
      nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    }],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  {
    firstName: "Priya",
    lastName: "Patel",
    email: "priya.patel@email.com",
    phone: "+91-9876543211",
    leadType: "patient",
    medicalCondition: "Cardiology Consultation",
    source: "referral",
    priority: 9,
    stage: "prospect",
    notes: [{
      content: "Referred by Dr. Singh. Patient has hypertension and needs cardiologist consultation.",
      createdAt: new Date()
    }],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    firstName: "Amit",
    lastName: "Kumar",
    email: "amit.kumar@email.com",
    phone: "+91-9876543212",
    leadType: "patient",
    medicalCondition: "Orthopedic Issues",
    source: "social_media",
    priority: 6,
    stage: "qualified",
    notes: [{
      content: "Patient has knee pain issues. Looking for orthopedic specialist. Prefers weekend appointments.",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
    }],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
  },
  {
    firstName: "Sunita",
    lastName: "Singh",
    email: "sunita.singh@email.com",
    phone: "+91-9876543213",
    leadType: "patient",
    medicalCondition: "Dermatology Consultation",
    source: "advertisement",
    priority: 5,
    stage: "prospect",
    notes: [{
      content: "Skin condition concern. Saw our Google ad. Interested in online consultation.",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    }],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
  },
  {
    firstName: "Vikram",
    lastName: "Gupta",
    email: "vikram.gupta@email.com",
    phone: "+91-9876543214",
    leadType: "patient",
    medicalCondition: "General Health Checkup",
    source: "website",
    priority: 4,
    stage: "prospect",
    notes: [{
      content: "Annual health checkup needed. Works in IT sector, desk job. Concerned about lifestyle diseases.",
      createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    }],
    createdAt: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
  },

  // Doctor Leads
  {
    firstName: "Dr. Anjali",
    lastName: "Mehta",
    email: "anjali.mehta@email.com",
    phone: "+91-9876543215",
    leadType: "doctor",
    specialization: "Pediatrics",
    source: "referral",
    priority: 9,
    stage: "qualified",
    notes: [{
      content: "Experienced pediatrician looking to join telemedicine platform. 15 years experience. Currently practicing in Mumbai.",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    }],
    interactions: [{
      type: "meeting",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      outcome: "Very interested - sent onboarding documents",
      nextFollowUp: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // tomorrow
    }],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
  },
  {
    firstName: "Dr. Rajesh",
    lastName: "Verma",
    email: "rajesh.verma@email.com",
    phone: "+91-9876543216",
    leadType: "doctor",
    specialization: "Cardiology",
    source: "website",
    priority: 8,
    stage: "prospect",
    notes: [{
      content: "Cardiologist with 10 years experience. Interested in telemedicine. Currently in Delhi. Wants flexible hours.",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    }],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
  },
  {
    firstName: "Dr. Kavita",
    lastName: "Joshi",
    email: "kavita.joshi@email.com",
    phone: "+91-9876543217",
    leadType: "doctor",
    specialization: "Dermatology",
    source: "social_media",
    priority: 7,
    stage: "qualified",
    notes: [{
      content: "Dermatologist interested in online consultations. Saw our LinkedIn post. Has own clinic but wants additional income stream.",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
    }],
    interactions: [{
      type: "call",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      outcome: "Scheduled demo session",
      nextFollowUp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // day after tomorrow
    }],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
  },
  {
    firstName: "Dr. Arjun",
    lastName: "Nair",
    email: "arjun.nair@email.com",
    phone: "+91-9876543218",
    leadType: "doctor",
    specialization: "Orthopedics",
    source: "advertisement",
    priority: 6,
    stage: "prospect",
    notes: [{
      content: "Orthopedic surgeon from Bangalore. Saw our Facebook ad. Young doctor eager to try new technologies.",
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
    }],
    createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000) // 15 hours ago
  },
  {
    firstName: "Dr. Neha",
    lastName: "Agarwal",
    email: "neha.agarwal@email.com",
    phone: "+91-9876543219",
    leadType: "doctor",
    specialization: "Gynecology",
    source: "referral",
    priority: 8,
    stage: "qualified",
    notes: [{
      content: "Gynecologist referred by Dr. Priya Sharma. 12 years experience. Very interested in women's health telemedicine.",
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000) // 18 hours ago
    }],
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000) // 20 hours ago
  },

  // High Priority Recent Leads
  {
    firstName: "Ravi",
    lastName: "Tiwari",
    email: "ravi.tiwari@email.com",
    phone: "+91-9876543220",
    leadType: "patient",
    medicalCondition: "Emergency Consultation",
    source: "website",
    priority: 10,
    stage: "qualified",
    notes: [{
      content: "URGENT: Patient needs immediate consultation for chest pain. Has history of heart disease.",
      createdAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
    }],
    interactions: [{
      type: "call",
      date: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      outcome: "Connected with on-call cardiologist",
      nextFollowUp: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    }],
    createdAt: new Date(Date.now() - 20 * 60 * 1000) // 20 minutes ago
  },
  {
    firstName: "Dr. Sanjay",
    lastName: "Reddy",
    email: "sanjay.reddy@email.com",
    phone: "+91-9876543221",
    leadType: "doctor",
    specialization: "Emergency Medicine",
    source: "referral",
    priority: 10,
    stage: "prospect",
    notes: [{
      content: "Emergency medicine specialist. Wants to join immediately for emergency consultations. Available 24/7.",
      createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    }],
    createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
  },

  // Converted Leads (Success Stories)
  {
    firstName: "Meera",
    lastName: "Shah",
    email: "meera.shah@email.com",
    phone: "+91-9876543222",
    leadType: "patient",
    medicalCondition: "Nutrition Consultation",
    source: "social_media",
    priority: 7,
    stage: "converted",
    converted: true,
    conversionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    notes: [{
      content: "Successfully converted. Had consultation with nutritionist. Very satisfied with service. Booked follow-up.",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }],
    interactions: [{
      type: "meeting",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      outcome: "Successful consultation - patient very happy",
      nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // next week
    }],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  {
    firstName: "Dr. Pooja",
    lastName: "Iyer",
    email: "pooja.iyer@email.com",
    phone: "+91-9876543223",
    leadType: "doctor",
    specialization: "Psychiatry",
    source: "website",
    priority: 9,
    stage: "converted",
    converted: true,
    conversionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    notes: [{
      content: "Successfully onboarded as psychiatrist. Completed all verifications. Already started taking appointments.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }],
    interactions: [{
      type: "meeting",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      outcome: "Onboarding completed successfully",
      nextFollowUp: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 weeks check-in
    }],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
  }
];

async function seedLeads() {
  try {
    console.log('🌱 Starting leads seeding process...');
    
    // Clear existing leads (optional - comment out if you want to keep existing data)
    await Lead.deleteMany({});
    console.log('🗑️  Cleared existing leads');

    // Insert sample leads
    const createdLeads = await Lead.insertMany(sampleLeads);
    console.log(`✅ Successfully seeded ${createdLeads.length} sample leads`);

    // Display summary statistics
    const stats = await Lead.aggregate([
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          patientLeads: { $sum: { $cond: [{ $eq: ["$leadType", "patient"] }, 1, 0] } },
          doctorLeads: { $sum: { $cond: [{ $eq: ["$leadType", "doctor"] }, 1, 0] } },
          highPriorityLeads: { $sum: { $cond: [{ $gte: ["$priority", 8] }, 1, 0] } },
          qualifiedLeads: { $sum: { $cond: [{ $eq: ["$stage", "qualified"] }, 1, 0] } },
          convertedLeads: { $sum: { $cond: [{ $eq: ["$stage", "converted"] }, 1, 0] } },
          avgPriority: { $avg: "$priority" }
        }
      }
    ]);

    console.log('\n📊 Lead Statistics:');
    console.log(`   Total Leads: ${stats[0].totalLeads}`);
    console.log(`   Patient Leads: ${stats[0].patientLeads}`);
    console.log(`   Doctor Leads: ${stats[0].doctorLeads}`);
    console.log(`   High Priority (8+): ${stats[0].highPriorityLeads}`);
    console.log(`   Qualified Leads: ${stats[0].qualifiedLeads}`);
    console.log(`   Converted Leads: ${stats[0].convertedLeads}`);
    console.log(`   Average Priority: ${stats[0].avgPriority.toFixed(2)}`);

    // Show leads by source
    const sourceStats = await Lead.aggregate([
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📈 Leads by Source:');
    sourceStats.forEach(source => {
      console.log(`   ${source._id}: ${source.count}`);
    });

    console.log('\n🎉 Lead seeding completed successfully!');
    console.log('💡 You can now test the Priority Queue algorithm with this sample data');
    console.log('🔗 Visit the admin panel to see lead management in action');

  } catch (error) {
    console.error('❌ Error seeding leads:', error);
  } finally {
    mongoose.disconnect();
    console.log('📪 Database connection closed');
  }
}

// Run the seeding script
if (require.main === module) {
  seedLeads();
}

module.exports = { seedLeads, sampleLeads };
