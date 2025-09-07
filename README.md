# 🚀 TaskFlow - Task Management System

A modern full-stack task management application built with **Laravel API backend** and **Angular frontend**.

## 🌟 Project Structure

### Frontend (Angular)
- **Built with:** Angular 16, TypeScript, SCSS
- **Features:** User interface, authentication, task management

### Backend (Laravel)
- **Built with:** Laravel 10, MySQL, Sanctum Auth
- **Features:** REST API, JWT authentication, database management

## ✨ Features

- ✅ User Authentication (Login/Register)
- ✅ Task Management (CRUD Operations)
- ✅ User Profile Management
- ✅ Role-Based Access Control
- ✅ Responsive Design

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve