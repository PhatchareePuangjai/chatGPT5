# Chat Logger v1.0 - Atomic Prompting Integration

## Overview

Version 1.0 ของ Chat Logger ที่ปรับปรุงด้วย **Atomic Prompting principles** จาก Context Engineering เพื่อเพิ่มประสิทธิภาพการใช้ token และคุณภาพการวิเคราะห์

## ✨ New Features

### 🎯 Atomic Prompting Principles

- **Token Efficiency**: วัดและติดตาม token usage
- **Prompt Analysis**: วิเคราะห์ structure ของ prompt ตาม `[TASK] + [CONSTRAINTS] + [OUTPUT FORMAT]`
- **Quality vs Token ROI**: วัดอัตราส่วนคุณภาพต่อ token ที่ใช้
- **Automatic Optimization**: แนะนำการปรับปรุง prompt

### 📊 Metrics Tracking

- Token count measurement (แม่นยำด้วย tiktoken)
- Prompt quality scoring
- Efficiency ratio calculation
- Comparison between atomic vs enhanced prompts

### 🎛️ Enhanced Analysis

- การวิเคราะห์การสนทนาด้วย minimal prompts
- การสร้าง atomic และ enhanced versions
- การเปรียบเทียบประสิทธิภาพ

## 📦 Installation

```bash
# Install dependencies
pip install -r requirements_v1.txt

# หรือติดตั้งแยก
pip install requests python-dotenv tiktoken
```

## 🚀 Usage

### Basic Usage

```bash
python export_to_sheet_v1_atomic.py chatgpt-export/conversations-28-09-2025.json
```

### Environment Variables

สร้างไฟล์ `.env`:

```env
GS_WEBAPP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
GS_API_KEY=your-secret-api-key
LOCAL_TZ=Asia/Bangkok
CACHE_FILE=.export_cache.json
METRICS_FILE=.prompt_metrics.json
```

## 📈 Metrics & Reports

### Efficiency Report

```
=== Atomic Prompting Efficiency Report ===
Total prompts analyzed: 25
Average tokens per prompt: 45.2
Average quality score: 3.85
Average efficiency ratio: 0.085
Token savings (enhanced vs atomic): -8.5
Quality improvement: +0.65
Efficiency ratio: 1.24
```

### Metrics Files

- `.prompt_metrics.json`: เก็บ history ของ prompt metrics
- `.export_cache.json`: cache สำหรับป้องกันการส่งซ้ำ

## 🔬 Atomic Prompting Examples

### Before (Original)

```
"Please analyze this conversation and tell me about the sentiment, clarity, and how useful the AI response was. I would appreciate if you could provide detailed feedback."
```

- Tokens: ~32
- Efficiency: Low (คำสุภาพซ้ำซ้อน)

### After (Atomic)

```
Analyze conversation quality:
User: [message]
AI: [response]

Output: sentiment|clarity|usefulness (1-5 each)
```

- Tokens: ~15
- Efficiency: High (ชัดเจน, กระชับ)

## 📊 Data Structure

### New Fields Added to Google Sheets

```json
{
  "session_id": "conversation_id",
  "user_prompt": "user message",
  "ai_response": "ai response",
  "atomic_analysis": "JSON string with analysis",
  "token_efficiency": 0.085,
  "quality_score": 3.8,
  "user_timestamp": "2025-09-20T10:30:00+07:00",
  "ai_timestamp": "2025-09-20T10:30:05+07:00"
}
```

### Atomic Analysis Structure

```json
{
  "atomic_prompt": {
    "prompt": "minimal prompt",
    "analysis": {
      "token_count": 15,
      "components": {
        "task": "Analyze conversation",
        "constraints": "1-5 scale only",
        "output_format": "sentiment|clarity|usefulness"
      },
      "atomic_score": 0.9,
      "optimization_suggestions": []
    },
    "quality": 3.5
  },
  "enhanced_prompt": {
    "prompt": "detailed prompt with context",
    "analysis": { "..." },
    "quality": 4.2
  },
  "comparison": {
    "token_savings": -8,
    "quality_improvement": 0.7,
    "efficiency_atomic": 0.233,
    "efficiency_enhanced": 0.175
  }
}
```

## 🔧 Key Classes

### `AtomicPromptAnalyzer`

- `analyze_atomic_prompt()`: วิเคราะห์ prompt structure
- `create_atomic_version()`: สร้าง atomic version
- `get_efficiency_report()`: สร้างรายงานประสิทธิภาพ

### `PromptMetrics`

```python
@dataclass
class PromptMetrics:
    prompt_text: str
    token_count: int
    response_length: int
    quality_score: float
    timestamp: str
    prompt_type: str  # "atomic" or "enhanced"
    efficiency_ratio: float  # quality/tokens
```

## 🎯 Atomic Prompting Principles Applied

### 1. Component Extraction

- **TASK**: Action verb + object (e.g., "Analyze conversation quality")
- **CONSTRAINTS**: Limits and requirements (e.g., "1-5 scale only")
- **OUTPUT FORMAT**: Structure specification (e.g., "JSON format")

### 2. Token Optimization

- ลบคำสุภาพที่ไม่จำเป็น ("please", "could you")
- ใช้คำสั่งตรงๆ แทนการขอร้อง
- กำหนด output format ชัดเจน

### 3. Quality Measurement

- Atomic score (0-1): ความสมบูรณ์ของ atomic structure
- Quality score (1-5): คุณภาพของ response
- Efficiency ratio: quality_score / token_count

## 📝 Example Output

```
[2025-09-20 15:30:25] เริ่มประมวลผลไฟล์: chatgpt-export/conversations-28-09-2025.json
[2025-09-20 15:30:25] พบ 15 การสนทนา
[2025-09-20 15:30:26] ส่งข้อมูลสำเร็จ: session abc123 (Tokens: 18, Quality: 3.80)
[2025-09-20 15:30:27] ส่งข้อมูลสำเร็จ: session def456 (Tokens: 22, Quality: 4.10)
...
[2025-09-20 15:30:35] ประมวลผลเสร็จสิ้น: ส่งสำเร็จ 15/15 การสนทนา
=== Atomic Prompting Efficiency Report ===
Total prompts analyzed: 30
Average tokens per prompt: 19.8
Average quality score: 3.92
Average efficiency ratio: 0.198
Token savings (enhanced vs atomic): -12.3
Quality improvement: +0.58
Efficiency ratio: 1.31
```

## 🔄 Comparison with Original

| Metric            | Original       | v1.0 Atomic         | Improvement |
| ----------------- | -------------- | ------------------- | ----------- |
| Token Efficiency  | ❌ No tracking | ✅ Detailed metrics | +100%       |
| Prompt Quality    | ❌ No analysis | ✅ Atomic scoring   | +100%       |
| Cost Optimization | ❌ None        | ✅ ROI tracking     | Measurable  |
| Analysis Depth    | ⚠️ Basic       | ✅ Multi-layer      | +60%        |

## 🚀 Next Steps

### Version 2.0 Planning: Molecules (Few-Shot Learning)

- เพิ่ม few-shot examples
- Context expansion patterns
- Template management
- Conversation memory

### Version 3.0 Planning: Cells (Memory Systems)

- Persistent conversation memory
- Session-based context
- Adaptive prompt improvement

## 🤝 Contributing

เมื่อใช้งานแล้ว ขอ feedback ในเรื่อง:

1. Token efficiency ที่วัดได้
2. Quality improvement ที่สังเกตได้
3. Performance ของ atomic prompts
4. Suggestions สำหรับ version ต่อไป

## 📄 License

Same as original project
