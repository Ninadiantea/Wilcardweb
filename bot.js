// FINAL VERSION: Multi-user Cloudflare Wildcard Bot
require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Simple in-memory session (REPLACE with DB/Redis for production)
const userSession = new Map();

const mainMenu = Markup.keyboard([
  ['🔑 Login Cloudflare', '🚪 Logout'],
  ['➕ Tambah Wildcard', '📜 Wildcard Aktif', '❌ Hapus Wildcard'],
  ['ℹ️ Bantuan']
]).resize();

bot.start((ctx) => {
  ctx.reply('Selamat datang di DIANA STORE Wildcard Bot!\nGunakan menu di bawah.', mainMenu);
});

bot.hears('ℹ️ Bantuan', (ctx) => {
  ctx.reply(`Bot ini untuk umum. Setiap user WAJIB login Cloudflare memakai API Token, Account ID, dan Zone ID milik sendiri.\n\nFitur:\n- 🔑 Login Cloudflare\n- ➕ Tambah Wildcard\n- 📜 Wildcard Aktif\n- ❌ Hapus Wildcard\n- 🚪 Logout\n\nData wildcard & kredensial Cloudflare mu aman dan tidak bisa diakses user lain.`, { parse_mode: 'Markdown' });
});

// Login Cloudflare (per user)
bot.hears('🔑 Login Cloudflare', async (ctx) => {
  userSession.set(ctx.from.id, { step: 'await_token' });
  ctx.reply('Masukkan *Cloudflare API Token* kamu:', { parse_mode: 'Markdown' });
});

bot.on('text', async (ctx, next) => {
  const sess = userSession.get(ctx.from.id);
  // Step: Login Cloudflare Token
  if (sess?.step === 'await_token') {
    sess.apiToken = ctx.message.text.trim();
    sess.step = 'await_account_id';
    userSession.set(ctx.from.id, sess);
    return ctx.reply('Masukkan *Cloudflare Account ID* kamu:', { parse_mode: 'Markdown' });
  }
  // Step: Login Cloudflare Account ID
  if (sess?.step === 'await_account_id') {
    sess.accountId = ctx.message.text.trim();
    sess.step = 'await_zone_id';
    userSession.set(ctx.from.id, sess);
    return ctx.reply('Masukkan *Cloudflare Zone ID* domain kamu:', { parse_mode: 'Markdown' });
  }
  // Step: Login Cloudflare Zone ID
  if (sess?.step === 'await_zone_id') {
    sess.zoneId = ctx.message.text.trim();
    // Opsi: Verifikasi credential valid
    try {
      const res = await axios.get(
        `https://api.cloudflare.com/client/v4/zones/${sess.zoneId}`,
        { headers: { Authorization: `Bearer ${sess.apiToken}` } }
      );
      if (!res.data.success) throw new Error('Invalid credential');
      sess.step = undefined;
      userSession.set(ctx.from.id, sess);
      ctx.reply('✅ Login Cloudflare berhasil!\nKamu sekarang bisa menambah dan melihat wildcard domain kamu.', mainMenu);
    } catch {
      userSession.delete(ctx.from.id);
      ctx.reply('❌ Login Cloudflare gagal. Pastikan API Token, Account ID, dan Zone ID benar.');
    }
    return;
  }
  // Step: Tambah Wildcard
  if (sess?.step === 'add_wildcard') {
    const subdomain = ctx.message.text.trim();
    // Proses wildcard, buat DNS record di Cloudflare
    try {
      // Menambah wildcard DNS record (type A ke 192.0.2.1 sebagai contoh)
      await axios.post(
        `https://api.cloudflare.com/client/v4/zones/${sess.zoneId}/dns_records`,
        {
          type: 'A',
          name: `*.${subdomain}`,
          content: '192.0.2.1',
          ttl: 1,
          proxied: true
        },
        { headers: { Authorization: `Bearer ${sess.apiToken}` } }
      );
      // Update ke Worker (KV per user)
      await axios.post(process.env.WORKER_API, {
        user_id: ctx.from.id,
        wildcard: `*.${subdomain}`
      });
      ctx.reply(`✅ Wildcard baru *.${subdomain} telah aktif dan bisa dicek di web!`);
    } catch (e) {
      ctx.reply('❌ Gagal menambah wildcard. Pastikan subdomain belum ada dan credential benar.');
    }
    sess.step = undefined;
    userSession.set(ctx.from.id, sess);
    return;
  }
  // Step: Hapus Wildcard
  if (sess?.step === 'del_wildcard') {
    const wildcard = ctx.message.text.trim();
    try {
      // Hapus DNS record di Cloudflare
      // 1. Cari id record
      const { data } = await axios.get(
        `https://api.cloudflare.com/client/v4/zones/${sess.zoneId}/dns_records?type=A&name=${encodeURIComponent(wildcard)}`,
        { headers: { Authorization: `Bearer ${sess.apiToken}` } }
      );
      if (!data.result.length) throw new Error('Record tidak ditemukan');
      const id = data.result[0].id;
      await axios.delete(
        `https://api.cloudflare.com/client/v4/zones/${sess.zoneId}/dns_records/${id}`,
        { headers: { Authorization: `Bearer ${sess.apiToken}` } }
      );
      // Update Worker (hapus dari KV user)
      await axios.delete(process.env.WORKER_API, {
        data: { user_id: ctx.from.id, wildcard }
      });
      ctx.reply(`✅ Wildcard ${wildcard} berhasil dihapus!`);
    } catch {
      ctx.reply('❌ Gagal menghapus wildcard.');
    }
    sess.step = undefined;
    userSession.set(ctx.from.id, sess);
    return;
  }
  next();
});

// Tambah wildcard (meminta subdomain)
bot.hears('➕ Tambah Wildcard', (ctx) => {
  const sess = userSession.get(ctx.from.id);
  if (!sess?.apiToken) return ctx.reply('Silakan login Cloudflare dulu!');
  sess.step = 'add_wildcard';
  userSession.set(ctx.from.id, sess);
  ctx.reply('Masukkan subdomain wildcard (tanpa * dan tanpa domain utama), contoh: sgdo');
});

// Lihat wildcard aktif
bot.hears('📜 Wildcard Aktif', async (ctx) => {
  const sess = userSession.get(ctx.from.id);
  if (!sess?.apiToken) return ctx.reply('Silakan login Cloudflare dulu!');
  try {
    const { data } = await axios.get(process.env.WORKER_API + `?user_id=${ctx.from.id}&json=1`);
    if (!data || !Array.isArray(data) || !data.length) {
      return ctx.reply('Belum ada wildcard aktif.');
    }
    ctx.reply('Wildcard aktif kamu:\n' + data.map(d => `🟢 ${d}`).join('\n'));
    ctx.reply(`Cek juga di web:\n${process.env.WORKER_PUBLIC}?user_id=${ctx.from.id}`);
  } catch {
    ctx.reply('Gagal mengambil daftar wildcard.');
  }
});

// Hapus wildcard
bot.hears('❌ Hapus Wildcard', async (ctx) => {
  const sess = userSession.get(ctx.from.id);
  if (!sess?.apiToken) return ctx.reply('Silakan login Cloudflare dulu!');
  // Ambil list untuk dipilih user
  try {
    const { data } = await axios.get(process.env.WORKER_API + `?user_id=${ctx.from.id}&json=1`);
    if (!data || !Array.isArray(data) || !data.length) {
      return ctx.reply('Tidak ada wildcard untuk dihapus.');
    }
    sess.step = 'del_wildcard';
    userSession.set(ctx.from.id, sess);
    ctx.reply('Masukkan wildcard yang ingin dihapus (copy dari daftar):\n' + data.map(d => d).join('\n'));
  } catch {
    ctx.reply('Gagal mengambil daftar wildcard.');
  }
});

// Logout
bot.hears('🚪 Logout', (ctx) => {
  userSession.delete(ctx.from.id);
  ctx.reply('🚪 Logout berhasil. Data Cloudflare kamu sudah dihapus dari bot.');
});

// Jalankan bot
bot.launch();
console.log('Bot Telegram DIANA STORE siap!');

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
