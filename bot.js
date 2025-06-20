// BOT TELEGRAM UMUM: Semua domain & worker di akun Cloudflare user masing-masing
require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const session = new Map();

const mainMenu = Markup.keyboard([
  ['🔑 Login Cloudflare', '🚪 Logout'],
  ['➕ Tambah Wildcard'],
  ['ℹ️ Bantuan']
]).resize();

bot.start((ctx) => {
  ctx.reply('Selamat datang di DIANA STORE Wildcard Bot!\nGunakan menu di bawah.', mainMenu);
});

bot.hears('ℹ️ Bantuan', (ctx) => {
  ctx.reply(`Bot ini hanya sebagai perantara.\n\nFitur:\n- Login Cloudflare (API token, Account ID, Zone ID/domain)\n- Tambah wildcard\n\nBot akan otomatis buat DNS wildcard dan deploy Worker web wildcard di subdomain milikmu (butuh token Cloudflare dengan izin DNS & Worker). Data Cloudflare kamu 100% tidak disimpan bot.`, { parse_mode: 'Markdown' });
});

bot.hears('🔑 Login Cloudflare', (ctx) => {
  session.set(ctx.from.id, { step: 'await_token' });
  ctx.reply('Masukkan *Cloudflare API Token* kamu:', { parse_mode: 'Markdown' });
});

bot.on('text', async (ctx, next) => {
  const sess = session.get(ctx.from.id);
  if (sess?.step === 'await_token') {
    sess.apiToken = ctx.message.text.trim();
    sess.step = 'await_account_id';
    session.set(ctx.from.id, sess);
    return ctx.reply('Masukkan *Cloudflare Account ID* kamu:', { parse_mode: 'Markdown' });
  }
  if (sess?.step === 'await_account_id') {
    sess.accountId = ctx.message.text.trim();
    sess.step = 'await_zone_id';
    session.set(ctx.from.id, sess);
    return ctx.reply('Masukkan *Cloudflare Zone ID* domain kamu:', { parse_mode: 'Markdown' });
  }
  if (sess?.step === 'await_zone_id') {
    sess.zoneId = ctx.message.text.trim();
    // Get domain name dari Zone ID user
    try {
      const res = await axios.get(
        `https://api.cloudflare.com/client/v4/zones/${sess.zoneId}`,
        { headers: { Authorization: `Bearer ${sess.apiToken}` } }
      );
      if (!res.data.success) throw new Error('Invalid credential');
      sess.domain = res.data.result.name;
      sess.step = undefined;
      session.set(ctx.from.id, sess);
      ctx.reply(`✅ Login Cloudflare berhasil!\nDomain: ${sess.domain}\nSekarang kamu bisa tambah wildcard.`, mainMenu);
    } catch {
      session.delete(ctx.from.id);
      ctx.reply('❌ Login Cloudflare gagal. Pastikan API Token, Account ID, dan Zone ID benar.');
    }
    return;
  }
  if (sess?.step === 'add_wildcard') {
    // Format: subdomain (misal: sg)
    const sub = ctx.message.text.trim().replace(/[^a-zA-Z0-9\-]/g, '');
    if (!sub) return ctx.reply('Subdomain tidak valid!');
    const wildcard = `*.${sub}.${sess.domain}`;
    const host = `${sub}.${sess.domain}`;
    try {
      // 1. Tambah DNS wildcard record
      await axios.post(
        `https://api.cloudflare.com/client/v4/zones/${sess.zoneId}/dns_records`,
        {
          type: 'A',
          name: `*.${sub}`,
          content: '192.0.2.1', // Bisa diubah sesuai preferensi user
          ttl: 1,
          proxied: true
        },
        { headers: { Authorization: `Bearer ${sess.apiToken}` } }
      );
      // 2. Deploy Worker web wildcard ke subdomain user
      // 2a. Upload Worker script
      const workerScript = fs.readFileSync(path.join(__dirname, 'worker_web.js'), 'utf8');
      await axios.put(
        `https://api.cloudflare.com/client/v4/accounts/${sess.accountId}/workers/scripts/wildcard_web_${sub}`,
        workerScript,
        {
          headers: {
            Authorization: `Bearer ${sess.apiToken}`,
            'Content-Type': 'application/javascript'
          }
        }
      );
      // 2b. Set Worker route
      await axios.post(
        `https://api.cloudflare.com/client/v4/zones/${sess.zoneId}/workers/routes`,
        {
          pattern: `${host}/*`,
          script: `wildcard_web_${sub}`
        },
        { headers: { Authorization: `Bearer ${sess.apiToken}` } }
      );
      ctx.reply(`✅ Wildcard DNS dan web wildcard aktif di: https://${host}\n\nBuka di browser untuk cek status wildcard kamu!`);
    } catch (e) {
      ctx.reply('❌ Gagal menambah wildcard dan deploy Worker. Pastikan token Cloudflare kamu punya izin DNS & Worker.');
    }
    sess.step = undefined;
    session.set(ctx.from.id, sess);
    return;
  }
  next();
});

bot.hears('➕ Tambah Wildcard', (ctx) => {
  const sess = session.get(ctx.from.id);
  if (!sess?.apiToken || !sess?.domain) return ctx.reply('Silakan login Cloudflare dulu!');
  sess.step = 'add_wildcard';
  session.set(ctx.from.id, sess);
  ctx.reply(`Masukkan subdomain wildcard (hanya sub, tanpa * dan tanpa domain utama)\n\nContoh: sg\nAkan dibuat *.sg.${sess.domain} dan https://sg.${sess.domain} untuk web wildcard`);
});

bot.hears('🚪 Logout', (ctx) => {
  session.delete(ctx.from.id);
  ctx.reply('🚪 Logout berhasil. Data Cloudflare kamu sudah dihapus dari bot.');
});

bot.launch();
console.log('Bot Telegram DIANA STORE siap!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
