#!/bin/bash
# =====================================================
#  NEXUS API Test Script
#  Usage: bash test_api.sh
#  Make sure backend is running: php -S localhost:8000 -t public
# =====================================================

BASE="http://localhost:8000/api"
PASS=0
FAIL=0
TOKEN=""
ADMIN_TOKEN=""

# ── Colours ──────────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

check() {
    local label="$1"
    local response="$2"
    local expected="$3"

    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✅ PASS${NC} $label"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC} $label"
        echo -e "   Expected: ${YELLOW}$expected${NC}"
        echo -e "   Got:      ${CYAN}$(echo "$response" | head -c 200)${NC}"
        ((FAIL++))
    fi
}

echo ""
echo "══════════════════════════════════════════"
echo "  NEXUS API Test Suite"
echo "══════════════════════════════════════════"
echo ""

# ── Health ────────────────────────────────────────────────────────
echo "── Health ──"
R=$(curl -s "$BASE/health")
check "Health check" "$R" '"status":"ok"'
echo ""

# ── Auth ──────────────────────────────────────────────────────────
echo "── Auth ──"
RAND=$RANDOM
R=$(curl -s -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"username\":\"testuser$RAND\",\"email\":\"test$RAND@test.com\",\"password\":\"pass123\"}")
check "Register new user" "$R" '"token"'
TOKEN=$(echo "$R" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

R=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test$RAND@test.com\",\"password\":\"pass123\"}")
check "Login" "$R" '"token"'

R=$(curl -s "$BASE/auth/me" -H "Authorization: Bearer $TOKEN")
check "Get current user (me)" "$R" '"username"'

R=$(curl -s -X POST "$BASE/auth/admin-login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nexus.com","password":"admin123"}')
check "Admin login" "$R" '"token"'
ADMIN_TOKEN=$(echo "$R" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

R=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"bad@bad.com","password":"wrong"}')
check "Login with wrong credentials returns error" "$R" '"error"'
echo ""

# ── Posts ─────────────────────────────────────────────────────────
echo "── Posts ──"
R=$(curl -s -X POST "$BASE/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello NEXUS! This is my first test post 🚀"}')
check "Create post" "$R" '"content"'
POST_ID=$(echo "$R" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

R=$(curl -s "$BASE/posts/feed" -H "Authorization: Bearer $TOKEN")
check "Get feed" "$R" '"data"'

R=$(curl -s "$BASE/posts/explore")
check "Explore (public)" "$R" '"data"'

R=$(curl -s -X POST "$BASE/posts/$POST_ID/like" -H "Authorization: Bearer $TOKEN")
check "Like post" "$R" 'Liked'

R=$(curl -s -X POST "$BASE/posts/$POST_ID/unlike" -H "Authorization: Bearer $TOKEN")
check "Unlike post" "$R" 'Unliked'

R=$(curl -s -X POST "$BASE/posts/$POST_ID/comments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Great post!"}')
check "Add comment" "$R" 'Comment added'

R=$(curl -s "$BASE/posts/$POST_ID/comments" -H "Authorization: Bearer $TOKEN")
check "Get comments" "$R" '"data"'

R=$(curl -s -X DELETE "$BASE/posts/$POST_ID" -H "Authorization: Bearer $TOKEN")
check "Delete own post" "$R" 'Deleted'
echo ""

# ── Users ─────────────────────────────────────────────────────────
echo "── Users ──"
R=$(curl -s "$BASE/users/1" -H "Authorization: Bearer $TOKEN")
check "Get user profile" "$R" '"user"'

R=$(curl -s "$BASE/users/search?q=admin" -H "Authorization: Bearer $TOKEN")
check "Search users" "$R" '"data"'

R=$(curl -s -X PUT "$BASE/users/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bio":"Updated bio from test","location":"Test City"}')
check "Update profile" "$R" 'Profile updated'

R=$(curl -s -X POST "$BASE/users/1/follow" -H "Authorization: Bearer $TOKEN")
check "Follow user" "$R" '"message"'

R=$(curl -s -X POST "$BASE/users/1/unfollow" -H "Authorization: Bearer $TOKEN")
check "Unfollow user" "$R" 'Unfollowed'
echo ""

# ── Search ────────────────────────────────────────────────────────
echo "── Search ──"
R=$(curl -s "$BASE/search?q=test" -H "Authorization: Bearer $TOKEN")
check "Unified search" "$R" '"users"'
echo ""

# ── Tasks ─────────────────────────────────────────────────────────
echo "── Tasks ──"
R=$(curl -s -X POST "$BASE/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task","description":"A test task description","location":"Remote","budget":"50"}')
check "Create task" "$R" '"title"'
TASK_ID=$(echo "$R" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

R=$(curl -s "$BASE/tasks" -H "Authorization: Bearer $TOKEN")
check "List tasks" "$R" '"data"'

R=$(curl -s "$BASE/tasks/mine" -H "Authorization: Bearer $TOKEN")
check "My tasks" "$R" '"data"'

R=$(curl -s -X PUT "$BASE/tasks/$TASK_ID/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}')
check "Update task status" "$R" 'Status updated'
echo ""

# ── Videos ────────────────────────────────────────────────────────
echo "── Videos ──"
R=$(curl -s "$BASE/videos" -H "Authorization: Bearer $TOKEN")
check "List videos" "$R" '"data"'

R=$(curl -s -X POST "$BASE/videos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Video","media":"https://example.com/video.mp4","description":"A test"}')
check "Create video" "$R" '"title"'
echo ""

# ── Messages ──────────────────────────────────────────────────────
echo "── Messages ──"
R=$(curl -s -X POST "$BASE/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiver_id":1,"content":"Hello admin, this is a test message!"}')
check "Send message" "$R" '"conversation_id"'
CONV_ID=$(echo "$R" | grep -o '"conversation_id":[0-9]*' | cut -d: -f2)

R=$(curl -s "$BASE/messages" -H "Authorization: Bearer $TOKEN")
check "List conversations" "$R" '"data"'

R=$(curl -s "$BASE/messages/$CONV_ID" -H "Authorization: Bearer $TOKEN")
check "Get conversation" "$R" '"data"'
echo ""

# ── Notifications ─────────────────────────────────────────────────
echo "── Notifications ──"
R=$(curl -s "$BASE/notifications" -H "Authorization: Bearer $TOKEN")
check "Get notifications" "$R" '"data"'

R=$(curl -s "$BASE/notifications/count" -H "Authorization: Bearer $TOKEN")
check "Get unread count" "$R" '"count"'

R=$(curl -s -X POST "$BASE/notifications/read" -H "Authorization: Bearer $TOKEN")
check "Mark all read" "$R" '"message"'
echo ""

# ── Reports ───────────────────────────────────────────────────────
echo "── Reports ──"
R=$(curl -s -X POST "$BASE/reports" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content_type":"user","content_id":1,"reason":"Test report"}')
check "Submit report" "$R" 'Report submitted'
echo ""

# ── Reputation ────────────────────────────────────────────────────
echo "── Reputation ──"
R=$(curl -s "$BASE/reputation/leaderboard" -H "Authorization: Bearer $TOKEN")
check "Leaderboard" "$R" '"data"'

R=$(curl -s "$BASE/reputation/me" -H "Authorization: Bearer $TOKEN")
check "My reputation score" "$R" '"trust_score"'
echo ""

# ── Admin ─────────────────────────────────────────────────────────
echo "── Admin ──"
R=$(curl -s "$BASE/admin/dashboard" -H "Authorization: Bearer $ADMIN_TOKEN")
check "Admin dashboard" "$R" '"stats"'

R=$(curl -s "$BASE/admin/users" -H "Authorization: Bearer $ADMIN_TOKEN")
check "Admin list users" "$R" '"data"'

R=$(curl -s "$BASE/admin/reports" -H "Authorization: Bearer $ADMIN_TOKEN")
check "Admin list reports" "$R" '"data"'

R=$(curl -s "$BASE/admin/flagged/posts" -H "Authorization: Bearer $ADMIN_TOKEN")
check "Admin flagged posts" "$R" '"data"'

R=$(curl -s "$BASE/admin/logs" -H "Authorization: Bearer $ADMIN_TOKEN")
check "Admin activity logs" "$R" '"data"'

# Non-admin cannot access admin routes
R=$(curl -s "$BASE/admin/dashboard" -H "Authorization: Bearer $TOKEN")
check "Non-admin blocked from admin routes" "$R" '"error"'
echo ""

# ── Password change ───────────────────────────────────────────────
echo "── Password Change ──"
R=$(curl -s -X POST "$BASE/auth/change-password" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"current_password":"pass123","new_password":"newpass456"}')
check "Change password" "$R" 'Password updated'

R=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test$RAND@test.com\",\"password\":\"newpass456\"}")
check "Login with new password" "$R" '"token"'
echo ""

# ── Summary ───────────────────────────────────────────────────────
TOTAL=$((PASS + FAIL))
echo "══════════════════════════════════════════"
echo -e "  Results: ${GREEN}$PASS passed${NC} / ${RED}$FAIL failed${NC} / $TOTAL total"
echo "══════════════════════════════════════════"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! NEXUS API is working correctly.${NC}"
else
    echo -e "${YELLOW}⚠️  $FAIL test(s) failed. Check backend is running on localhost:8000${NC}"
fi
echo ""
