<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\TableController;
use App\Http\Controllers\Api\V1\MenuController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\SettingController;
use App\Http\Controllers\Api\V1\UserController;

// ─── Auth ───────────────────────────────────────────────────────────────────
Route::post('/v1/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/v1/auth/logout', [AuthController::class, 'logout']);
    Route::get('/v1/auth/me', [AuthController::class, 'me']);
});

// ─── Public / Customer QR ───────────────────────────────────────────────────
Route::get('/v1/menu', [MenuController::class, 'index']);
Route::get('/v1/tables/{restaurantTable}', [TableController::class, 'show']);
Route::post('/v1/tables/{restaurantTable}/orders', [OrderController::class, 'store']);
Route::post('/v1/orders/{order}/items', [OrderController::class, 'addItems']);
Route::get('/v1/orders/{order}', [OrderController::class, 'show']);
Route::get('/v1/settings', [SettingController::class, 'index']);

// ─── Staff (waiter, chef, owner) ────────────────────────────────────────────
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/v1/tables', [TableController::class, 'index']);
    Route::post('/v1/tables/{restaurantTable}/open-order', [TableController::class, 'openOrder']);

    Route::get('/v1/orders', [OrderController::class, 'index']);
    Route::post('/v1/orders', [OrderController::class, 'store']);
    Route::patch('/v1/orders/{order}/items/{orderItem}', [OrderController::class, 'updateItem']);
    Route::delete('/v1/orders/{order}/items/{orderItem}', [OrderController::class, 'destroyItem']);
    Route::post('/v1/orders/{order}/bill', [OrderController::class, 'bill']);

    Route::post('/v1/orders/{order}/pay', [PaymentController::class, 'pay']);
});

// ─── Owner only ─────────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role:owner'])->group(function () {
    Route::apiResource('/v1/categories', CategoryController::class);

    Route::get('/v1/menu/items', [MenuController::class, 'indexItems']);
    Route::post('/v1/menu/items', [MenuController::class, 'storeItem']);
    Route::patch('/v1/menu/items/{menuItem}', [MenuController::class, 'updateItem']);
    Route::delete('/v1/menu/items/{menuItem}', [MenuController::class, 'destroyItem']);

    Route::get('/v1/reports/monthly', [ReportController::class, 'monthly']);
    Route::get('/v1/reports/daily', [ReportController::class, 'daily']);

    Route::put('/v1/settings', [SettingController::class, 'update']);

    Route::get('/v1/users', [UserController::class, 'index']);
    Route::post('/v1/users', [UserController::class, 'store']);
    Route::patch('/v1/users/{user}', [UserController::class, 'update']);
    Route::delete('/v1/users/{user}', [UserController::class, 'destroy']);
});
