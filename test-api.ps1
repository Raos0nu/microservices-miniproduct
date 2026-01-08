# Test Microservices API
$baseUrl = "http://localhost:3000"

Write-Host "=== Testing Microservices API ===" -ForegroundColor Cyan

# Test 1: Register a new user
Write-Host "`n1. Registering user..." -ForegroundColor Yellow
$registerData = @{
    email = "testuser@example.com"
    password = "test123456"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✓ Registration successful!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.user.id)" -ForegroundColor Gray
    Write-Host "Email: $($registerResponse.user.email)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit
}

# Test 2: Login
Write-Host "`n2. Logging in..." -ForegroundColor Yellow
$loginData = @{
    email = "testuser@example.com"
    password = "test123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit
}

# Test 3: Get user profile
Write-Host "`n3. Getting user profile..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $userResponse = Invoke-RestMethod -Uri "$baseUrl/api/users/me" -Method GET -Headers $headers
    Write-Host "✓ User profile retrieved!" -ForegroundColor Green
    Write-Host "User: $($userResponse.first_name) $($userResponse.last_name)" -ForegroundColor Gray
    Write-Host "Email: $($userResponse.email)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Get user failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 4: Create an order
Write-Host "`n4. Creating order..." -ForegroundColor Yellow
$orderData = @{
    items = @(
        @{
            name = "Product 1"
            quantity = 2
            price = 50.00
        }
    )
    totalAmount = 100.00
} | ConvertTo-Json -Depth 3

try {
    $orderResponse = Invoke-RestMethod -Uri "$baseUrl/api/orders" -Method POST -Body $orderData -ContentType "application/json" -Headers $headers
    Write-Host "✓ Order created!" -ForegroundColor Green
    Write-Host "Order ID: $($orderResponse.order.id)" -ForegroundColor Gray
    Write-Host "Total: $($orderResponse.order.total_amount)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Create order failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 5: Get orders
Write-Host "`n5. Getting orders..." -ForegroundColor Yellow
try {
    $ordersResponse = Invoke-RestMethod -Uri "$baseUrl/api/orders" -Method GET -Headers $headers
    Write-Host "✓ Orders retrieved!" -ForegroundColor Green
    Write-Host "Number of orders: $($ordersResponse.orders.Count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Get orders failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan

