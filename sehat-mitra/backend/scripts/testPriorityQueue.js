const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const { LeadQualificationEngine } = require('../algorithms/priorityQueue');

async function testPriorityQueue() {
  try {
    console.log('🧪 Testing Priority Queue Algorithm with Sample Leads');
    console.log('=' .repeat(60));
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sehat-mitra');
    
    // Fetch all leads from database
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    console.log(`📋 Found ${leads.length} leads in database\n`);
    
    if (leads.length === 0) {
      console.log('❌ No leads found! Please run seedLeads.js first');
      return;
    }
    
    // Initialize the Lead Qualification Engine
    const engine = new LeadQualificationEngine();
    
    // Add all leads to the priority queue
    console.log('🔄 Adding leads to priority queue...');
    leads.forEach(lead => {
      engine.addLead(lead);
      console.log(`   Added: ${lead.firstName} ${lead.lastName} (Priority: ${lead.priority})`);
    });
    
    console.log(`\n✅ Successfully added ${leads.length} leads to priority queue\n`);
    
    // Process leads by priority
    console.log('🎯 Processing leads in priority order:');
    console.log('-'.repeat(80));
    
    let processedCount = 0;
    while (!engine.isEmpty() && processedCount < 10) {
      const lead = engine.getNextLead();
      processedCount++;
      
      const priorityIcon = lead.priority >= 9 ? '🔥' : lead.priority >= 7 ? '⚡' : lead.priority >= 5 ? '📋' : '📝';
      const typeIcon = lead.leadType === 'doctor' ? '👩‍⚕️' : '🧑‍🤝‍🧑';
      const stageIcon = lead.stage === 'converted' ? '✅' : lead.stage === 'qualified' ? '🎯' : '⏳';
      
      console.log(`${processedCount.toString().padStart(2)}. ${priorityIcon} Priority ${lead.priority} | ${typeIcon} ${lead.firstName} ${lead.lastName}`);
      console.log(`    📧 ${lead.email} | 📞 ${lead.phone}`);
      console.log(`    ${stageIcon} ${lead.stage.toUpperCase()} | 📍 ${lead.source} | 🏷️ ${lead.leadType}`);
      
      if (lead.leadType === 'patient') {
        console.log(`    🏥 Condition: ${lead.medicalCondition}`);
      } else {
        console.log(`    🩺 Specialization: ${lead.specialization}`);
      }
      
      if (lead.notes && lead.notes.length > 0) {
        console.log(`    💬 "${lead.notes[0].content.substring(0, 60)}..."`);
      }
      
      console.log('');
    }
    
    // Show algorithm performance metrics
    console.log('📊 Algorithm Performance Metrics:');
    console.log('-'.repeat(40));
    console.log(`   Total Leads Processed: ${processedCount}`);
    console.log(`   Remaining in Queue: ${engine.size()}`);
    console.log(`   Time Complexity: O(log n) per operation`);
    console.log(`   Space Complexity: O(n) for storage`);
    
    // Test lead scoring algorithm
    console.log('\n🧮 Testing Lead Scoring Algorithm:');
    console.log('-'.repeat(40));
    
    const testLead = {
      firstName: "Test",
      lastName: "Lead",
      source: "referral",
      leadType: "patient",
      stage: "qualified",
      createdAt: new Date(),
      interactions: [{ type: "call" }]
    };
    
    const calculatedPriority = engine.calculateLeadPriority(testLead);
    console.log(`   Test Lead Base Priority: ${calculatedPriority}`);
    console.log(`   Scoring Factors:`);
    console.log(`     - Source (referral): +2 points`);
    console.log(`     - Stage (qualified): +1 point`);
    console.log(`     - Has interactions: +1 point`);
    console.log(`     - Recent (today): +1 point`);
    
  } catch (error) {
    console.error('❌ Error testing priority queue:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n📪 Database connection closed');
  }
}

// Run the test
if (require.main === module) {
  testPriorityQueue();
}

module.exports = { testPriorityQueue };
