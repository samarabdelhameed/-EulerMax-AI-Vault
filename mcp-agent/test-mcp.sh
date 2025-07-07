#!/bin/bash

set -e

GREEN='\033[0;32m'
NC='\033[0m'

# Health check
echo -e "${GREEN}1. Health Check...${NC}"
curl -s http://localhost:4000/api/health | grep '"status":"ok"' && echo "Health OK" || (echo "Health check failed" && exit 1)

echo -e "${GREEN}\n2. Testing /ask endpoint with multiple questions...${NC}"

QUESTIONS=(
  "هل أحتاج لإعادة توازن المحفظة؟"
  "ما هو أفضل أصل للاحتفاظ به الآن؟"
  "هل impermanent loss عالي جدًا؟"
  "هل الوقت مناسب للسحب؟"
)

for q in "${QUESTIONS[@]}"; do
  echo -e "\n${GREEN}سؤال: $q${NC}"
  curl -s -X POST http://localhost:4000/ask \
    -H "Content-Type: application/json" \
    -d "{\"question\": \"$q\"}" | jq .
done

echo -e "\n${GREEN}✅ كل الاختبارات تمت بنجاح!${NC}" 