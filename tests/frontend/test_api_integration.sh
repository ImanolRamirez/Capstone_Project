#!/bin/bash
# =============================================================================
# Frontend API Integration Tests
# Tests every endpoint the frontend depends on via cURL against the live Flask API.
# Run from the project root with: bash tests/frontend/test_api_integration.sh
# Requires: Flask running inside Capstone_web container on port 5000
# =============================================================================

BASE_URL="http://localhost:5000/api"
PASS=0
FAIL=0

assert_contains() {
    local test_name="$1"
    local response="$2"
    local expected="$3"

    if echo "$response" | grep -q "$expected"; then
        echo "  PASS: $test_name"
        PASS=$((PASS + 1))
    else
        echo "  FAIL: $test_name"
        echo "        Expected to find: $expected"
        echo "        Got: $response"
        FAIL=$((FAIL + 1))
    fi
}

assert_not_contains() {
    local test_name="$1"
    local response="$2"
    local unexpected="$3"

    if echo "$response" | grep -q "$unexpected"; then
        echo "  FAIL: $test_name"
        echo "        Expected NOT to find: $unexpected"
        echo "        Got: $response"
        FAIL=$((FAIL + 1))
    else
        echo "  PASS: $test_name"
        PASS=$((PASS + 1))
    fi
}

# =============================================================================
echo ""
echo "=== AUTH TESTS ==="
# =============================================================================

# Login - valid credentials
RESPONSE=$(docker exec Capstone_web curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ryanjoshua@example.net", "password": "Password123!"}')
assert_contains "Login with valid credentials returns access_token" "$RESPONSE" "access_token"

TOKEN=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('access_token',''))" 2>/dev/null)

# Login - wrong password
RESPONSE=$(docker exec Capstone_web curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ryanjoshua@example.net", "password": "wrongpassword"}')
assert_contains "Login with wrong password is rejected" "$RESPONSE" "Invalid email or password"

# Login - non-existent user
RESPONSE=$(docker exec Capstone_web curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{"email": "nobody@fake.com", "password": "Password123!"}')
assert_contains "Login with non-existent user is rejected" "$RESPONSE" "Invalid email or password"

# Register - duplicate email
RESPONSE=$(docker exec Capstone_web curl -s -X POST $BASE_URL/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"ryanjoshua@example.net","password":"Password123!","securityQuestion":"Pet?","securityAnswer":"dog"}')
assert_contains "Register with duplicate email is rejected" "$RESPONSE" "User email already exists"

# Register - weak password
RESPONSE=$(docker exec Capstone_web curl -s -X POST $BASE_URL/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"brandnew@test.com","password":"weakpass","securityQuestion":"Pet?","securityAnswer":"dog"}')
assert_contains "Register with weak password is rejected" "$RESPONSE" "Password must be at least 8 characters"

# Register - missing required fields
RESPONSE=$(docker exec Capstone_web curl -s -X POST $BASE_URL/register \
  -H "Content-Type: application/json" \
  -d '{"email":"incomplete@test.com","password":"Password123!"}')
assert_contains "Register with missing fields is rejected" "$RESPONSE" "required"

# =============================================================================
echo ""
echo "=== PROTECTED ROUTE TESTS ==="
# =============================================================================

# Access protected route without token
RESPONSE=$(docker exec Capstone_web curl -s $BASE_URL/accounts)
assert_contains "Accessing accounts without token is blocked" "$RESPONSE" "Missing Authorization Header"

RESPONSE=$(docker exec Capstone_web curl -s $BASE_URL/transactions)
assert_contains "Accessing transactions without token is blocked" "$RESPONSE" "Missing Authorization Header"

RESPONSE=$(docker exec Capstone_web curl -s $BASE_URL/debts)
assert_contains "Accessing debts without token is blocked" "$RESPONSE" "Missing Authorization Header"

RESPONSE=$(docker exec Capstone_web curl -s $BASE_URL/budgets)
assert_contains "Accessing budgets without token is blocked" "$RESPONSE" "Missing Authorization Header"

# =============================================================================
echo ""
echo "=== ACCOUNTS TESTS ==="
# =============================================================================

RESPONSE=$(docker exec Capstone_web curl -s $BASE_URL/accounts \
  -H "Authorization: Bearer $TOKEN")
assert_contains "Get accounts returns Checking account" "$RESPONSE" "Checking"
assert_contains "Get accounts returns Savings account" "$RESPONSE" "Savings"
assert_not_contains "Get accounts does not return loan accounts" "$RESPONSE" "Auto Loan"

# =============================================================================
echo ""
echo "=== TRANSACTIONS TESTS ==="
# =============================================================================

RESPONSE=$(docker exec Capstone_web curl -s $BASE_URL/transactions \
  -H "Authorization: Bearer $TOKEN")
assert_contains "Get transactions returns results" "$RESPONSE" "amount"
assert_contains "Get transactions includes category" "$RESPONSE" "category"
assert_contains "Get transactions includes date" "$RESPONSE" "date"

# =============================================================================
echo ""
echo "=== DEBTS TESTS ==="
# =============================================================================

RESPONSE=$(docker exec Capstone_web curl -s $BASE_URL/debts \
  -H "Authorization: Bearer $TOKEN")
assert_contains "Get debts returns Auto Loan" "$RESPONSE" "Auto Loan"
assert_contains "Get debts returns Mortgage" "$RESPONSE" "Mortgage"
assert_contains "Get debts includes APR" "$RESPONSE" "apr"
assert_contains "Get debts includes monthly payment" "$RESPONSE" "monthlyPayment"
assert_contains "Get debts includes payments remaining" "$RESPONSE" "paymentsRemaining"

# =============================================================================
echo ""
echo "=== TRANSFER TESTS ==="
# =============================================================================

ACCOUNTS=$(docker exec Capstone_web curl -s $BASE_URL/accounts -H "Authorization: Bearer $TOKEN")
FROM_ID=$(echo "$ACCOUNTS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'])" 2>/dev/null)
TO_ID=$(echo "$ACCOUNTS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[1]['id'])" 2>/dev/null)

# Transfer - insufficient funds
RESPONSE=$(docker exec Capstone_web curl -s -X POST $BASE_URL/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"from_account_id\": $FROM_ID, \"to_account_id\": $TO_ID, \"amount\": 9999999}")
assert_contains "Transfer with insufficient funds is rejected" "$RESPONSE" "Insufficient funds"

# Transfer - valid amount
RESPONSE=$(docker exec Capstone_web curl -s -X POST $BASE_URL/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"from_account_id\": $FROM_ID, \"to_account_id\": $TO_ID, \"amount\": 1}")
assert_contains "Transfer with valid amount succeeds" "$RESPONSE" "amount"

# Reverse the transfer to leave data unchanged
docker exec Capstone_web curl -s -X POST $BASE_URL/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"from_account_id\": $TO_ID, \"to_account_id\": $FROM_ID, \"amount\": 1}" > /dev/null

# =============================================================================
echo ""
echo "=== BUDGETS TESTS ==="
# =============================================================================

RESPONSE=$(docker exec Capstone_web curl -s "$BASE_URL/budgets?month=4&year=2026" \
  -H "Authorization: Bearer $TOKEN")
assert_not_contains "Get budgets does not return an error" "$RESPONSE" "error"

# =============================================================================
echo ""
echo "=== USER PROFILE TESTS ==="
# =============================================================================

RESPONSE=$(docker exec Capstone_web curl -s $BASE_URL/user/me \
  -H "Authorization: Bearer $TOKEN")
assert_contains "Get current user returns email" "$RESPONSE" "email"
assert_contains "Get current user returns first name" "$RESPONSE" "firstName"

# =============================================================================
echo ""
echo "============================================="
echo " Results: $PASS passed, $FAIL failed"
echo "============================================="
echo ""
