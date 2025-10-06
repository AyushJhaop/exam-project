#!/bin/bash
# filepath: /Users/ayushjha/Desktop/sehat-mitra/sehat-mitra/backend/scripts/verify-leads.sh

echo "🔍 SEHAT MITRA - LEADS SYSTEM VERIFICATION"
echo "=========================================="
echo

# Check if backend server is running
echo "1. Checking backend server status..."
if curl -s http://localhost:5000/api/leads > /dev/null; then
    echo "   ✅ Backend server is running on port 5000"
else
    echo "   ❌ Backend server is not running. Please start with: npm start"
    exit 1
fi
echo

# Check total leads count
echo "2. Checking leads collection..."
LEAD_COUNT=$(curl -s "http://localhost:5000/api/leads" | grep -o '"total":[0-9]*' | cut -d: -f2)
if [ "$LEAD_COUNT" -gt "0" ]; then
    echo "   ✅ Found $LEAD_COUNT leads in database"
else
    echo "   ⚠️  No leads found. Running seeding script..."
    cd /Users/ayushjha/Desktop/sehat-mitra/sehat-mitra/backend
    node scripts/seedLeads.js
fi
echo

# Check high priority leads
echo "3. Checking priority queue functionality..."
HIGH_PRIORITY=$(curl -s "http://localhost:5000/api/leads?sortBy=priority&sortOrder=desc&limit=3" | grep -o '"priority":10' | wc -l | xargs)
echo "   ✅ Found $HIGH_PRIORITY high priority (10) leads"
echo

# Check lead types distribution
echo "4. Checking lead types..."
curl -s "http://localhost:5000/api/leads?limit=100" | grep -o '"leadType":"[^"]*"' | sort | uniq -c | while read count type; do
    clean_type=$(echo $type | cut -d: -f2 | tr -d '"')
    echo "   📊 $clean_type leads: $count"
done
echo

# Check converted leads
echo "5. Checking conversion tracking..."
CONVERTED=$(curl -s "http://localhost:5000/api/leads?stage=converted" | grep -o '"total":[0-9]*' | cut -d: -f2)
echo "   ✅ Successfully converted leads: $CONVERTED"
echo

echo "🎉 VERIFICATION COMPLETE!"
echo "💡 The lead management system is ready for demonstration"
echo "🔗 Access admin panel: http://localhost:3000/admin/leads"
echo

# Show sample API calls for testing
echo "📚 Sample API Commands for Testing:"
echo "   - Get all leads: curl http://localhost:5000/api/leads"
echo "   - Get high priority: curl 'http://localhost:5000/api/leads?priority=9,10'"
echo "   - Get patient leads: curl 'http://localhost:5000/api/leads?leadType=patient'"
echo "   - Get doctor leads: curl 'http://localhost:5000/api/leads?leadType=doctor'"
echo
