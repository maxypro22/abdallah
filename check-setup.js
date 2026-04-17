#!/usr/bin/env node

/**
 * سكريبت للتحقق من إعدادات المشروع قبل النشر على Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 فحص إعدادات المشروع...\n');

// ألوان للطباعة
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    reset: '\x1b[0m'
};

const success = (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`);
const error = (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`);
const warning = (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
const info = (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`);

let hasErrors = false;

// 1. فحص ملف .env للكلاينت
console.log('📱 فحص إعدادات الكلاينت:');
const clientEnvPath = path.join(__dirname, 'client', '.env');
if (fs.existsSync(clientEnvPath)) {
    const clientEnv = fs.readFileSync(clientEnvPath, 'utf8');

    if (clientEnv.includes('VITE_API_URL=')) {
        const apiUrl = clientEnv.match(/VITE_API_URL=(.+)/)?.[1]?.trim();

        if (!apiUrl || apiUrl === 'https://your-server-url.vercel.app') {
            error('VITE_API_URL غير مضبوط في client/.env');
            info('يجب تعديل VITE_API_URL ليشير لرابط السيرفر الحقيقي');
            hasErrors = true;
        } else {
            success(`VITE_API_URL: ${apiUrl}`);
        }
    } else {
        error('VITE_API_URL غير موجود في client/.env');
        hasErrors = true;
    }
} else {
    error('ملف client/.env غير موجود');
    info('قم بإنشاء الملف من client/.env.example');
    hasErrors = true;
}

console.log('\n🖥️  فحص إعدادات السيرفر:');
const serverEnvPath = path.join(__dirname, 'server', '.env');
if (fs.existsSync(serverEnvPath)) {
    const serverEnv = fs.readFileSync(serverEnvPath, 'utf8');

    // فحص MONGODB_URI
    if (serverEnv.includes('MONGODB_URI=')) {
        const mongoUri = serverEnv.match(/MONGODB_URI=(.+)/)?.[1]?.trim();

        if (mongoUri?.includes('127.0.0.1') || mongoUri?.includes('localhost')) {
            warning('MONGODB_URI يشير لقاعدة بيانات محلية');
            info('للنشر على Vercel، استخدم MongoDB Atlas');
        } else if (mongoUri?.includes('mongodb+srv://')) {
            success('MONGODB_URI مضبوط (MongoDB Atlas)');
        } else {
            error('MONGODB_URI غير صحيح');
            hasErrors = true;
        }
    } else {
        error('MONGODB_URI غير موجود في server/.env');
        hasErrors = true;
    }

    // فحص JWT_SECRET
    if (serverEnv.includes('JWT_SECRET=')) {
        success('JWT_SECRET موجود');
    } else {
        error('JWT_SECRET غير موجود في server/.env');
        hasErrors = true;
    }
} else {
    error('ملف server/.env غير موجود');
    info('قم بإنشاء الملف من server/.env.example');
    hasErrors = true;
}

// 3. فحص ملفات vercel.json
console.log('\n☁️  فحص إعدادات Vercel:');
const serverVercelPath = path.join(__dirname, 'server', 'vercel.json');
if (fs.existsSync(serverVercelPath)) {
    success('server/vercel.json موجود');
} else {
    error('server/vercel.json غير موجود');
    hasErrors = true;
}

const clientVercelPath = path.join(__dirname, 'client', 'vercel.json');
if (fs.existsSync(clientVercelPath)) {
    success('client/vercel.json موجود');
} else {
    error('client/vercel.json غير موجود');
    hasErrors = true;
}

// 4. النتيجة النهائية
console.log('\n' + '='.repeat(50));
if (hasErrors) {
    error('يوجد مشاكل يجب حلها قبل النشر');
    console.log('\n📖 اقرأ VERCEL_SETUP_GUIDE_AR.md للمزيد من التفاصيل\n');
    process.exit(1);
} else {
    success('كل الإعدادات صحيحة! ✨');
    console.log('\n📝 خطوات النشر على Vercel:');
    info('1. نشر السيرفر أولاً وانسخ رابط الـ Production');
    info('2. ضع رابط السيرفر في VITE_API_URL على Vercel (للكلاينت)');
    info('3. ضع MONGODB_URI و JWT_SECRET على Vercel (للسيرفر)');
    info('4. نشر الكلاينت');
    console.log('');
}
