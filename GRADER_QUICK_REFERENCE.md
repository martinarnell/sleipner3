# Multi-Dimensional Grader - Quick Reference

## 🎯 System Overview
**5 Dimensions**: Accuracy, Completeness, Clarity, Depth, Safety  
**5 Question Types**: FACTUAL, ANALYTICAL, TECHNICAL, CREATIVE, ETHICAL  
**Parallel Processing**: Concurrent evaluation for speed  

## 📊 Question Types & Thresholds

| Type | Threshold | Primary Weight | Examples |
|------|-----------|----------------|----------|
| **FACTUAL** | 85/100 | Accuracy (40%) | "Capital of France?", "2+2?" |
| **ANALYTICAL** | 75/100 | Depth (35%) | "Business strategy", "Market analysis" |
| **TECHNICAL** | 80/100 | Accuracy (35%) | "Configure K8s", "Debug code" |
| **CREATIVE** | 70/100 | Balanced (25% each) | "Write poem", "Create story" |
| **ETHICAL** | 75/100 | All equal (20%) | "Should AI be regulated?" |

## 🔍 Dimensions (1-10 Scale)

### Accuracy
- **10**: Completely accurate, verified facts
- **5**: Some inaccuracies present
- **1**: Major factual errors

### Completeness  
- **10**: All aspects thoroughly covered
- **5**: Main points covered, details missing
- **1**: Major gaps, incomplete

### Clarity
- **10**: Exceptionally clear, well-structured  
- **5**: Generally clear but improvable
- **1**: Unclear, poorly structured

### Depth
- **10**: Deep analysis, exceptional insights
- **5**: Moderate analysis depth
- **1**: Shallow, superficial

### Safety
- **10**: Completely safe and appropriate
- **5**: Generally safe, minor concerns
- **1**: Safety/ethical concerns

## 🚀 Testing Commands

### Simple Test
```bash
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "x-sleipner-debug: full" \
  -d '{"messages":[{"role":"user","content":"What is 2+2?"}],"model":"gpt-4"}'
```

### Get Score Only
```bash
# ... | jq '.sleipner.debug.performance_metrics | {score: .quality_score, tier: .tier_used}'
```

### Full Breakdown
```bash
# ... | jq '.sleipner.debug.flow_steps[] | select(.step == 3) | {score, questionType, threshold, passed, dimensionScores}'
```

## ⚙️ Configuration Locations

**File**: `src/app/api/v1/chat/completions/route.ts`

**Thresholds**:
```javascript
QUESTION_TYPE_WEIGHTS = {
  FACTUAL: { threshold: 85 },
  ANALYTICAL: { threshold: 75 },
  // ...
}
```

**Weights**:
```javascript
FACTUAL: { 
  accuracy: 0.40, completeness: 0.30, 
  clarity: 0.20, depth: 0.05, safety: 0.05 
}
```

## 📈 Expected Performance

| Question Type | Typical Score Range | Tier-0 Pass Rate |
|---------------|-------------------|------------------|
| Simple Facts | 90-98/100 | ~95% |
| Business Analysis | 75-95/100 | ~80% |
| Technical Questions | 85-97/100 | ~90% |
| Creative Content | 70-92/100 | ~85% |
| Ethical Questions | 75-90/100 | ~85% |

## 🔧 Common Adjustments

**Too Many Escalations**: Lower thresholds by 5-10 points
**Too Few Escalations**: Raise thresholds by 5-10 points  
**Wrong Classifications**: Update classification prompt examples
**Inconsistent Scoring**: Review dimension evaluation prompts

## 💰 Cost & Performance
- **Cost**: ~$0.01-0.02 per evaluation
- **Latency**: 2-4 seconds (parallel processing)
- **API Calls**: 6 total (1 classification + 5 dimensions)

## 🎛️ Debug Headers
```bash
-H "x-sleipner-debug: full"        # Complete debug output
-H "force_escalate: true"          # Force tier-1 routing
```

## ✅ Quick Health Check
1. Test factual question → Should score 90+ and stay tier-0
2. Test complex analysis → Should score appropriately for content quality
3. Test nonsense question → Should score low and escalate
4. Check all 5 question types classify correctly
5. Verify dimension breakdowns make sense

---
*For complete documentation, see `MULTI_DIMENSIONAL_GRADER.md`* 