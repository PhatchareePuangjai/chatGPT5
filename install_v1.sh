#!/bin/bash
# install_v1.sh
# Installation script for Chat Logger v1.0

echo "🚀 Installing Chat Logger v1.0 with Atomic Prompting..."
echo "================================================="

# ตรวจสอบ Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.7+"
    exit 1
fi

echo "✅ Python3 found: $(python3 --version)"

# ติดตั้ง dependencies
echo "📦 Installing dependencies..."
pip3 install requests python-dotenv tiktoken

# ตรวจสอบการติดตั้ง
echo "🔍 Verifying installation..."
python3 -c "import requests, json, tiktoken; print('✅ All dependencies installed successfully')" 2>/dev/null || {
    echo "⚠️  Some dependencies failed to install. Installing basic requirements only..."
    pip3 install requests
    echo "ℹ️  You can run with basic functionality (without tiktoken for token counting)"
}

# สร้างไฟล์ .env ตัวอย่าง
if [ ! -f .env ]; then
    echo "📝 Creating sample .env file..."
    cat > .env << EOF
# Google Sheets Configuration
GS_WEBAPP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
GS_API_KEY=your-secret-api-key

# Settings
LOCAL_TZ=Asia/Bangkok
CACHE_FILE=.export_cache.json
METRICS_FILE=.prompt_metrics.json
EOF
    echo "✅ Created .env file - please update with your actual values"
else
    echo "ℹ️  .env file already exists"
fi

# ทดสอบการทำงาน
echo "🧪 Running test suite..."
python3 test_atomic_prompting.py

echo ""
echo "🎉 Installation completed!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your Google Sheets URL and API key"
echo "2. Run: python3 export_to_sheet_v1_atomic.py your_conversation_file.json"
echo "3. Check .prompt_metrics.json for efficiency reports"
echo ""
echo "Features added in v1.0:"
echo "✅ Atomic prompting principles"
echo "✅ Token efficiency tracking"
echo "✅ Quality vs ROI measurement"
echo "✅ Automatic prompt optimization"