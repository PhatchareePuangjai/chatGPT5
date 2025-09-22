# export_to_sheet_v1_atomic.py
# Version 1.0: Context Engineering - Atomic Prompting Integration
# ================================================================
"""
Chat Logger v1.0 with Atomic Prompting Principles
==================================================

เพิ่มการใช้งาน Atomic Prompting จาก Context Engineering:
1. Token efficiency measurement
2. Atomic prompt analysis
3. Quality vs Token ROI tracking
4. Minimal context enhancement

Based on Context Engineering principles:
- [TASK] + [CONSTRAINTS] + [OUTPUT FORMAT]
- Token budget optimization
- Response quality measurement
"""

import json, os, re, time
import requests
import hashlib
from datetime import datetime
from zoneinfo import ZoneInfo
from typing import Dict, List, Any
from dataclasses import dataclass

# Optional imports with fallbacks
try:
    import tiktoken  # เพิ่มสำหรับนับ token แม่นยำ

    tokenizer = tiktoken.get_encoding("cl100k_base")  # GPT-4 tokenizer
except ImportError:
    tokenizer = None
    print("Warning: tiktoken not available, using approximation")

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not available, using environment variables directly")

    def load_dotenv():
        pass

    load_dotenv()

GS_WEBAPP_URL = os.getenv(
    "GS_WEBAPP_URL", "https://script.google.com/macros/s/XXXX/exec"
)
GS_API_KEY = os.getenv("GS_API_KEY", "my-secret-12345")
TZ = os.getenv("LOCAL_TZ", "Asia/Bangkok")
CACHE_FILE = os.getenv("CACHE_FILE", ".export_cache.json")
METRICS_FILE = os.getenv("METRICS_FILE", ".prompt_metrics.json")


@dataclass
class PromptMetrics:
    """Class สำหรับเก็บ metrics ของ prompt"""

    prompt_text: str  # ข้อความ prompt (เก็บ 100 ตัวอักษรแรก)
    token_count: int  # จำนวน token ที่ใช้ (วัดด้วย tiktoken)
    response_length: int  # ความยาวของ response ที่ได้
    quality_score: float  # คะแนนคุณภาพ (1-5)
    timestamp: str  # เวลาที่สร้าง metrics
    prompt_type: str  # ประเภท: "atomic" หรือ "enhanced"
    efficiency_ratio: float  # อัตราส่วน quality/tokens


class AtomicPromptAnalyzer:
    """Analyzer สำหรับ Atomic Prompting principles"""

    def __init__(self):
        self.metrics_history = []
        self.load_metrics()

    def count_tokens(self, text: str) -> int:
        """นับ tokens แม่นยำด้วย tiktoken หรือ approximation"""
        if tokenizer:
            return len(tokenizer.encode(text))
        else:
            # Rough approximation: 1 token ≈ 4 characters
            return max(1, len(text) // 4)

    def analyze_atomic_prompt(self, prompt: str) -> Dict[str, Any]:
        """วิเคราะห์ prompt ตาม atomic principles"""
        analysis = {
            "token_count": self.count_tokens(prompt),
            "components": self._extract_components(prompt),
            "atomic_score": self._calculate_atomic_score(prompt),
            "optimization_suggestions": self._suggest_optimizations(prompt),
        }
        return analysis

    def _extract_components(self, prompt: str) -> Dict[str, str]:
        """แยก components: TASK + CONSTRAINTS + OUTPUT FORMAT"""
        # Simple heuristic extraction
        lines = prompt.strip().split("\n")
        components = {"task": "", "constraints": "", "output_format": ""}

        # ค้นหา patterns
        for line in lines:
            line = line.strip()
            if any(
                word in line.lower()
                for word in ["analyze", "extract", "summarize", "classify"]
            ):
                components["task"] = line
            elif any(
                word in line.lower() for word in ["format:", "output:", "return:"]
            ):
                components["output_format"] = line
            elif any(
                word in line.lower() for word in ["only", "must", "should", "limit"]
            ):
                components["constraints"] = line

        return components

    def _calculate_atomic_score(self, prompt: str) -> float:
        """คำนวณคะแนน atomic principles (0-1)"""
        score = 0.0

        # มี task ชัดเจน
        if any(
            word in prompt.lower()
            for word in ["analyze", "extract", "summarize", "classify", "identify"]
        ):
            score += 0.4

        # มี constraints
        if any(
            word in prompt.lower()
            for word in ["only", "must", "should", "limit", "between", "maximum"]
        ):
            score += 0.3

        # มี output format
        if any(
            word in prompt.lower()
            for word in ["format:", "output:", "return:", "json", "list"]
        ):
            score += 0.3

        return min(1.0, score)

    def _suggest_optimizations(self, prompt: str) -> List[str]:
        """แนะนำการปรับปรุง prompt"""
        suggestions = []

        if self.count_tokens(prompt) > 100:
            suggestions.append("ลดความยาว prompt - ใช้คำสั้นๆ ชัดเจน")

        if "please" in prompt.lower() or "could you" in prompt.lower():
            suggestions.append("ลบคำสุภาพ - ใช้คำสั่งตรงๆ")

        if not any(
            word in prompt.lower() for word in ["format:", "output:", "return:"]
        ):
            suggestions.append("เพิ่ม output format ที่ชัดเจน")

        if len(prompt.split("\n")) == 1 and len(prompt) > 50:
            suggestions.append("แบ่งเป็นหลายบรรทัดเพื่อความชัดเจน")

        return suggestions

    def create_atomic_version(self, original_prompt: str) -> str:
        """สร้าง atomic version ของ prompt"""
        # Extract core task
        core_task = self._extract_core_task(original_prompt)

        # Create atomic structure
        atomic_prompt = f"{core_task}\n\nOutput: JSON format with result only."

        return atomic_prompt

    def _extract_core_task(self, prompt: str) -> str:
        """Extract core task จาก prompt"""
        # ใช้ regex หา action verbs
        action_pattern = (
            r"\b(analyze|extract|summarize|classify|identify|list|find|determine)\b"
        )
        match = re.search(action_pattern, prompt, re.IGNORECASE)

        if match:
            # หาประโยคที่มี action verb
            sentences = prompt.split(".")
            for sentence in sentences:
                if match.group().lower() in sentence.lower():
                    return sentence.strip()

        # fallback - ใช้ส่วนแรกของ prompt
        return prompt.split(".")[0].strip()

    def save_metrics(self, metrics: PromptMetrics):
        """บันทึก metrics"""
        self.metrics_history.append(metrics)
        self._save_metrics_to_file()

    def load_metrics(self):
        """โหลด metrics จากไฟล์"""
        try:
            if os.path.exists(METRICS_FILE):
                with open(METRICS_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    # Convert dict back to PromptMetrics
                    self.metrics_history = [PromptMetrics(**item) for item in data]
        except Exception as e:
            print(f"Error loading metrics: {e}")
            self.metrics_history = []

    def _save_metrics_to_file(self):
        """บันทึก metrics ลงไฟล์"""
        try:
            # Convert PromptMetrics to dict for JSON serialization
            data = [
                {
                    "prompt_text": (
                        m.prompt_text[:100] + "..."
                        if len(m.prompt_text) > 100
                        else m.prompt_text
                    ),
                    "token_count": m.token_count,
                    "response_length": m.response_length,
                    "quality_score": m.quality_score,
                    "timestamp": m.timestamp,
                    "prompt_type": m.prompt_type,
                    "efficiency_ratio": m.efficiency_ratio,
                }
                for m in self.metrics_history
            ]

            with open(METRICS_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving metrics: {e}")

    def get_efficiency_report(self) -> Dict[str, Any]:
        """สร้างรายงาน efficiency"""
        if not self.metrics_history:
            return {"message": "No metrics data available"}

        # คำนวณ averages
        total_tokens = sum(m.token_count for m in self.metrics_history)
        total_quality = sum(m.quality_score for m in self.metrics_history)
        count = len(self.metrics_history)

        atomic_metrics = [m for m in self.metrics_history if m.prompt_type == "atomic"]
        enhanced_metrics = [
            m for m in self.metrics_history if m.prompt_type == "enhanced"
        ]

        report = {
            "total_prompts": count,
            "avg_tokens": total_tokens / count,
            "avg_quality": total_quality / count,
            "avg_efficiency": sum(m.efficiency_ratio for m in self.metrics_history)
            / count,
            "atomic_prompts": len(atomic_metrics),
            "enhanced_prompts": len(enhanced_metrics),
        }

        if atomic_metrics and enhanced_metrics:
            atomic_avg_tokens = sum(m.token_count for m in atomic_metrics) / len(
                atomic_metrics
            )
            enhanced_avg_tokens = sum(m.token_count for m in enhanced_metrics) / len(
                enhanced_metrics
            )

            atomic_avg_quality = sum(m.quality_score for m in atomic_metrics) / len(
                atomic_metrics
            )
            enhanced_avg_quality = sum(m.quality_score for m in enhanced_metrics) / len(
                enhanced_metrics
            )

            report["comparison"] = {
                "token_savings": enhanced_avg_tokens - atomic_avg_tokens,
                "quality_difference": enhanced_avg_quality - atomic_avg_quality,
                "efficiency_improvement": (
                    (atomic_avg_quality / atomic_avg_tokens)
                    / (enhanced_avg_quality / enhanced_avg_tokens)
                    if enhanced_avg_tokens > 0
                    else 0
                ),
            }

        return report


# Initialize analyzer
prompt_analyzer = AtomicPromptAnalyzer()


def log(message):
    print(f"[{datetime.now(ZoneInfo(TZ)).strftime('%Y-%m-%d %H:%M:%S')}] {message}")


def iso(ts):
    if ts is None:
        return datetime.now(ZoneInfo(TZ)).isoformat()
    return datetime.fromtimestamp(float(ts), tz=ZoneInfo(TZ)).isoformat()


def load_cache():
    try:
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}
    except Exception as e:
        log(f"เกิดข้อผิดพลาดในการโหลดแคช: {str(e)}")
        return {}


def save_cache(cache):
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
    except Exception as e:
        log(f"เกิดข้อผิดพลาดในการบันทึกแคช: {str(e)}")


def create_row_hash(row):
    key = f"{row['session_id']}_{row['timestamp']}_{row['user_prompt'][:50]}_{row['ai_response'][:50]}"
    return hashlib.md5(key.encode("utf-8")).hexdigest()


def analyze_conversation_with_atomic_prompts(
    user_prompt: str, ai_response: str
) -> Dict[str, Any]:
    """วิเคราะห์การสนทนาด้วย atomic prompting principles"""

    # สร้าง atomic prompt สำหรับการวิเคราะห์
    atomic_analysis_prompt = f"""Analyze conversation quality:
        User: {user_prompt[:200]}
        AI: {ai_response[:200]}
        Output: sentiment|clarity|usefulness (1-5 each)
    """

    # วิเคราะห์ atomic prompt
    prompt_analysis = prompt_analyzer.analyze_atomic_prompt(atomic_analysis_prompt)

    # สร้าง enhanced version
    enhanced_prompt = f"""
        Task: Analyze conversation quality and user satisfaction.
        Input:
        - User message: {user_prompt[:200]}
        - AI response: {ai_response[:200]}

        Constraints:
        - Rate each dimension 1-5 only
        - Focus on helpfulness and clarity

        Output format:
        {{"sentiment": X, "clarity": X, "usefulness": X, "overall": X}}
    """

    enhanced_analysis: Dict[str, Any] = prompt_analyzer.analyze_atomic_prompt(
        enhanced_prompt
    )

    # Mock quality assessment (ในการใช้งานจริงจะเรียก LLM)
    quality_atomic = 3.5  # placeholder
    quality_enhanced = 4.2  # placeholder

    # บันทึก metrics
    atomic_metrics = PromptMetrics(
        prompt_text=atomic_analysis_prompt,
        token_count=prompt_analysis["token_count"],
        response_length=50,  # mock
        quality_score=quality_atomic,
        timestamp=datetime.now(ZoneInfo(TZ)).isoformat(),
        prompt_type="atomic",
        efficiency_ratio=quality_atomic / prompt_analysis["token_count"],
    )

    enhanced_metrics = PromptMetrics(
        prompt_text=enhanced_prompt,
        token_count=enhanced_analysis["token_count"],
        response_length=80,  # mock
        quality_score=quality_enhanced,
        timestamp=datetime.now(ZoneInfo(TZ)).isoformat(),
        prompt_type="enhanced",
        efficiency_ratio=quality_enhanced / enhanced_analysis["token_count"],
    )

    prompt_analyzer.save_metrics(atomic_metrics)
    prompt_analyzer.save_metrics(enhanced_metrics)

    return {
        "atomic_prompt": {
            "prompt": atomic_analysis_prompt,
            "analysis": prompt_analysis,
            "quality": quality_atomic,
        },
        "enhanced_prompt": {
            "prompt": enhanced_prompt,
            "analysis": enhanced_analysis,
            "quality": quality_enhanced,
        },
        "comparison": {
            "token_savings": enhanced_analysis["token_count"]
            - prompt_analysis["token_count"],
            "quality_improvement": quality_enhanced - quality_atomic,
            "efficiency_atomic": atomic_metrics.efficiency_ratio,
            "efficiency_enhanced": enhanced_metrics.efficiency_ratio,
        },
    }


def _save_to_local_file(row):
    """บันทึกข้อมูลใน local file เมื่อไม่สามารถส่งไป Google Sheets ได้"""
    local_output_file = "chat_analysis_output.json"

    # โหลดข้อมูลเดิม
    try:
        if os.path.exists(local_output_file):
            with open(local_output_file, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
        else:
            existing_data = []
    except:
        existing_data = []

    # เพิ่มข้อมูลใหม่
    existing_data.append(row)

    # บันทึกกลับ
    try:
        with open(local_output_file, "w", encoding="utf-8") as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=2)
        log(f"💾 บันทึกข้อมูลใน {local_output_file}")
    except Exception as e:
        log(f"❌ ไม่สามารถบันทึกข้อมูลได้: {e}")


def _save_to_local_file(data):
    """บันทึกข้อมูลลงไฟล์ local เมื่อส่งไปยัง Google Sheets ไม่ได้"""
    try:
        import os
        from datetime import datetime

        # สร้างโฟลเดอร์ backup ถ้ายังไม่มี
        backup_dir = "backup_data"
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)

        # สร้างชื่อไฟล์ตามวันที่และเวลา
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{backup_dir}/chat_export_{timestamp}.json"

        # บันทึกข้อมูล
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        log(f"💾 บันทึกไฟล์ local สำเร็จ: {filename}")
        return filename

    except Exception as e:
        log(f"❌ ไม่สามารถบันทึกไฟล์ local ได้: {str(e)}")
        return None


def post(row, cache):
    # สร้าง hash key จากข้อมูล
    row_hash = create_row_hash(row)

    # ตรวจสอบว่าเคยส่งข้อมูลนี้แล้วหรือไม่
    if row_hash in cache:
        log(f"ข้ามข้อมูลที่ซ้ำ: session {row['session_id']}")
        return False

    # วิเคราะห์การสนทนาด้วย atomic prompting
    conversation_analysis = analyze_conversation_with_atomic_prompts(
        row["user_prompt"], row["ai_response"]
    )

    # เพิ่มข้อมูลการวิเคราะห์ลงใน row
    row["atomic_analysis"] = json.dumps(conversation_analysis, ensure_ascii=False)
    row["token_efficiency"] = conversation_analysis["comparison"]["efficiency_atomic"]
    row["quality_score"] = conversation_analysis["atomic_prompt"]["quality"]

    # Debug: แสดงข้อมูลที่จะส่ง
    log(f"📤 กำลังส่งข้อมูล: session {row['session_id']}")
    log(f"   URL: {GS_WEBAPP_URL}")
    log(f"   User prompt: {row['user_prompt'][:50]}...")
    log(
        f"   Quality: {row['quality_score']:.2f}, Efficiency: {row['token_efficiency']:.3f}"
    )

    # ตรวจสอบว่า URL และ API key ถูกต้องหรือไม่
    if (
        GS_WEBAPP_URL == "https://script.google.com/macros/s/XXXX/exec"
        or GS_API_KEY == "my-secret-12345"
    ):
        log("⚠️  กำลังใช้ configuration เริ่มต้น - โปรดแก้ไข .env file")
        log("   เก็บข้อมูลใน local file แทน...")
        _save_to_local_file(row)
        return True

    try:
        # เพิ่ม api_key ลงใน row เหมือน v0
        row["api_key"] = GS_API_KEY

        # ส่งข้อมูลไปยัง Google Sheets (ใช้รูปแบบเดียวกับ v0)
        response = requests.post(
            GS_WEBAPP_URL,
            json=row,  # ส่งข้อมูลโดยตรงแทนการห่อด้วย action/apiKey
            headers={"Content-Type": "application/json"},
            timeout=30,
        )

        if response.status_code == 200:
            log(
                f"✅ ส่งข้อมูลสำเร็จ: session {row['session_id']} (Tokens: {conversation_analysis['atomic_prompt']['analysis']['token_count']}, Quality: {row['quality_score']:.2f})"
            )

            # ใช้วิธีเดียวกับ v0 - ไม่ต้องเช็ค JSON response
            # บันทึกลงแคชเมื่อส่งสำเร็จ
            cache[row_hash] = {
                "timestamp": row["timestamp"],
                "session_id": row["session_id"],
                "atomic_analysis": conversation_analysis,
            }
            return True
        else:
            log(f"❌ HTTP Error {response.status_code}: {response.text[:200]}")
            log("💾 บันทึกข้อมูลใน local file แทน...")
            _save_to_local_file(row)
            return True  # ยังคืน True เพราะบันทึกได้แล้ว

    except requests.exceptions.Timeout:
        log("⏰ การเชื่อมต่อหมดเวลา (timeout)")
        log("💾 บันทึกข้อมูลใน local file แทน...")
        _save_to_local_file(row)
        return True
    except requests.exceptions.RequestException as e:
        log(f"🌐 เกิดข้อผิดพลาดในการส่งข้อมูล: {str(e)}")
        log("💾 บันทึกข้อมูลใน local file แทน...")
        _save_to_local_file(row)
        return True


def export_conversations_to_sheet(json_file_path):
    """ส่งข้อมูลการสนทนาไปยัง Google Sheets พร้อมการวิเคราะห์ atomic prompting"""

    log(f"เริ่มประมวลผลไฟล์: {json_file_path}")

    # โหลดแคช
    cache = load_cache()

    try:
        with open(json_file_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        if not isinstance(data, list):
            log("รูปแบบข้อมูลไม่ถูกต้อง: ต้องเป็น array")
            return

        success_count = 0
        total_count = len(data)

        log(f"พบ {total_count} การสนทนา")

        for conversation in data:
            try:
                mapping = conversation.get("mapping", {})
                session_id = conversation.get("id", "unknown")
                title = conversation.get("title", "")
                create_t = conversation.get("create_time")

                log(f"🔍 ประมวลผล conversation: {session_id}")
                log(f"   Title: {title}")
                log(f"   พบ nodes: {len(mapping)} nodes")

                # ใช้วิธีเดียวกับ v0: เรียงตามเวลาและอ่านตามลำดับ
                nodes = list(mapping.values())
                nodes.sort(key=lambda n: n.get("create_time") or 0)

                # วนอ่านเฉพาะข้อความที่มาจาก user/assistant
                user_buf = None
                user_timestamp = None

                for n in nodes:
                    m = n.get("message")
                    if not m:
                        continue

                    role = m.get("author", {}).get("role")
                    parts = m.get("content", {}).get("parts") or []
                    text = "\n".join([p for p in parts if isinstance(p, str)]).strip()

                    if not text:
                        continue

                    log(f"   📝 {role}: {text[:50]}...")

                    if role == "user":
                        user_buf = text
                        user_timestamp = m.get("create_time")
                        log(f"   👤 บันทึก user message: {text[:100]}...")

                    elif role == "assistant":
                        # จับคู่ user → assistant
                        ai_response = text
                        ai_timestamp = m.get("create_time")

                        log(f"   🤖 พบ AI response: {text[:100]}...")

                        # สร้างข้อมูลสำหรับส่งไป Google Sheets
                        row = {
                            "session_id": session_id,
                            "user_prompt": user_buf or "",
                            "ai_response": ai_response,
                            "user_timestamp": iso(user_timestamp or create_t),
                            "ai_timestamp": iso(ai_timestamp or create_t),
                            "timestamp": iso(user_timestamp or create_t),
                        }

                        log(f"   📤 เรียก post() function...")
                        # ส่งข้อมูล
                        if post(row, cache):
                            success_count += 1
                            log(f"   ✅ post() สำเร็จ! Total: {success_count}")
                        else:
                            log(f"   ❌ post() ล้มเหลว!")

                        # รีเซ็ต user buffer หลังส่งแล้ว
                        user_buf = None
                        user_timestamp = None

                        # หน่วงเวลาเล็กน้อยเพื่อไม่ให้ API rate limit
                        time.sleep(0.1)

                # ถ้ามี user ค้าง (ไม่มีคำตอบ) ก็เก็บเฉพาะ user
                if user_buf:
                    log(f"   👤 พบ user message ค้าง: {user_buf[:100]}...")
                    row = {
                        "session_id": session_id,
                        "user_prompt": user_buf,
                        "ai_response": "",
                        "user_timestamp": iso(user_timestamp or create_t),
                        "ai_timestamp": iso(create_t),
                        "timestamp": iso(user_timestamp or create_t),
                    }

                    log(f"   📤 เรียก post() สำหรับ user ค้าง...")
                    if post(row, cache):
                        success_count += 1
                        log(f"   ✅ post() สำเร็จ! Total: {success_count}")
                    else:
                        log(f"   ❌ post() ล้มเหลว!")

            except Exception as e:
                log(f"เกิดข้อผิดพลาดในการประมวลผลการสนทนา {session_id}: {str(e)}")
                continue

        # บันทึกแคช
        save_cache(cache)

        log(f"ประมวลผลเสร็จสิ้น: ส่งสำเร็จ {success_count}/{total_count} การสนทนา")

        # แสดงรายงาน efficiency
        efficiency_report = prompt_analyzer.get_efficiency_report()
        log("=== Atomic Prompting Efficiency Report ===")
        log(f"Total prompts analyzed: {efficiency_report.get('total_prompts', 0)}")
        log(f"Average tokens per prompt: {efficiency_report.get('avg_tokens', 0):.1f}")
        log(f"Average quality score: {efficiency_report.get('avg_quality', 0):.2f}")
        log(
            f"Average efficiency ratio: {efficiency_report.get('avg_efficiency', 0):.3f}"
        )

        if "comparison" in efficiency_report:
            comp = efficiency_report["comparison"]
            log(
                f"Token savings (enhanced vs atomic): {comp.get('token_savings', 0):.1f}"
            )
            log(f"Quality improvement: {comp.get('quality_difference', 0):.2f}")
            log(f"Efficiency ratio: {comp.get('efficiency_improvement', 0):.3f}")

    except FileNotFoundError:
        log(f"ไม่พบไฟล์: {json_file_path}")
    except json.JSONDecodeError:
        log(f"ไฟล์ JSON ไม่ถูกต้อง: {json_file_path}")
    except Exception as e:
        log(f"เกิดข้อผิดพลาดที่ไม่คาดคิด: {str(e)}")


if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2:
        print("Usage: python export_to_sheet_v1_atomic.py <json_file_path>")
        print(
            "Example: python export_to_sheet_v1_atomic.py chatgpt-export/conversations-28-09-2025.json"
        )
        sys.exit(1)

    json_file_path = sys.argv[1]
    export_conversations_to_sheet(json_file_path)
