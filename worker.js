export default {
  async fetch(request, env, ctx) {
    const host = new URL(request.url).host;
    const wildcard = `*.${host}`;
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Wildcard Aktif - ${host}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Poppins:700,400&display=swap" rel="stylesheet">
  <style>
    body { margin:0; background:#161824; font-family:'Poppins',Arial,sans-serif; min-height:100vh; color:#e7f5ff;}
    .header {background:linear-gradient(90deg,#2196f3 60%,#1de9b6 100%);color:#fff;text-align:center;padding:32px 8px 12px 8px;font-size:2rem;font-weight:700;
    border-bottom-left-radius:30px;border-bottom-right-radius:30px;box-shadow:0 4px 18px 0 rgba(33,150,243,0.18);letter-spacing:3px;}
    .subtitle{text-align:center;margin-top:6px;color:#b2ebf2;font-size:1.05rem;font-weight:400;margin-bottom:18px;}
    .wildcard-list-container{max-width:450px;margin:0 auto;padding:16px;}
    .wildcard-list{background:#101225;border-radius:18px;box-shadow:0 2px 8px 0 rgba(29,233,182,0.13);padding:18px 10px;margin-top:10px;}
    .wildcard-row{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #273046;padding:10px 0 10px 0;font-size:1.08rem;}
    .wildcard-row:last-child{border-bottom:none;}
    .badge{background:#1de9b6;color:#111;border-radius:18px;padding:2px 14px 2px 14px;font-size:0.93em;font-weight:500;margin-left:10px;box-shadow:0 1px 4px rgba(29,233,182,0.12);letter-spacing:1px;}
    .rules {background:linear-gradient(90deg,#2196f3 40%,#1de9b6 100%);border-radius:14px;margin:22px auto 14px auto;padding:16px 14px 10px 14px;max-width:400px; box-shadow:0 2px 8px 0 rgba(33,150,243,0.13);}
    .rules-title {font-size:1.13rem;font-weight:700;color:#fff;margin-bottom:8px;letter-spacing:1px;}
    .rules ul {padding-left:18px;font-size:1rem;color:#e3f2fd;}
    .rules li {margin-bottom:6px;}
    .owner-contact {margin:24px auto 0 auto;max-width:400px;display:flex;align-items:center;justify-content:center;gap:10px;}
    .owner-contact a {display:inline-flex;align-items:center;background:#25d366;color:#111;font-weight:600;padding:9px 22px 9px 18px;border-radius:28px;text-decoration:none;box-shadow:0 2px 8px rgba(37,211,102,0.13);transition:background .2s;}
    .owner-contact a:hover {background:#1de9b6;}
    .wa-logo {height:24px;width:24px;margin-right:10px;}
    @media (max-width:600px){
      .header{font-size:1.3rem;padding:22px 4px 8px 4px;}
      .wildcard-list-container{max-width:99vw;padding:8px;}
      .wildcard-list{padding:12px 5px;}
      .wildcard-row{font-size:0.98rem;}
      .rules{max-width:99vw;padding:12px 8px;}
      .owner-contact{max-width:98vw;}
      .owner-contact a{padding:8px 10px;}
      .wa-logo{height:18px;width:18px;margin-right:6px;}
    }
  </style>
</head>
<body>
  <div class="header">DIANA STORE</div>
  <div class="subtitle">Wildcard domain aktif untuk <b style="color:#1de9b6">${host}</b></div>
  <div class="wildcard-list-container">
    <div class="wildcard-list">
      <div class="wildcard-row">
        <span>🟢 <span style="color:#1de9b6">${wildcard}</span></span>
        <span class="badge">Aktif</span>
      </div>
    </div>
  </div>
  <div class="rules">
    <div class="rules-title">Peraturan Penggunaan Wildcard Tunneling</div>
    <ul>
      <li><b style="color:#fff176">Dilarang</b> digunakan untuk aktivitas ilegal, spam, scam, atau phishing.</li>
      <li><b style="color:#fff176">Dilarang</b> menyerang server lain atau abuse layanan.</li>
      <li>Gunakan hanya untuk keperluan legal dan sesuai aturan Cloudflare/ISP.</li>
      <li><b style="color:#fff176">Dilarang</b> mengubah DNS/subdomain utama tanpa izin owner.</li>
      <li>Pelanggaran akan dikenakan <b style="color:#ff8a65">banned permanen</b>.</li>
      <li>Kontak owner jika ada pertanyaan.</li>
    </ul>
  </div>
  <div class="owner-contact">
    <a href="https://wa.me/6285723657734" target="_blank" title="Hubungi via WhatsApp">
      <svg class="wa-logo" viewBox="0 0 32 32"><circle fill="#25d366" cx="16" cy="16" r="16"/><path d="M23.5 8.5A8.9 8.9 0 0 0 16 6a9 9 0 0 0-9 9c0 1.4.3 2.7.8 3.9L6 26l7.2-1.9a8.8 8.8 0 0 0 2.8.4c5 0 9-4 9-9a8.9 8.9 0 0 0-2.5-6.1zm-7.5 15c-1 0-2-.1-3-.5l-.2-.1-4.2 1.1 1.1-4.1-.1-.2A7.1 7.1 0 0 1 7 15a7 7 0 0 1 14 0c0 3.9-3.2 7-7 7zm3.9-5.3c-.2-.1-1.2-.6-1.4-.7-.2-.1-.4-.2-.6.2-.2.3-.6.7-.8.9-.1.2-.3.2-.5.1-.2-.1-.9-.3-1.7-1-.6-.6-1-1.4-1.1-1.6-.1-.2 0-.3.1-.4.1-.1.2-.3.3-.4.1-.2.1-.4 0-.6l-.7-1.6c-.2-.4-.4-.3-.6-.3h-.5c-.2 0-.5.1-.8.3-.2.2-.8.8-.8 1.8 0 1 .8 2 1.1 2.4.3.3 1.6 2.6 4 3.5.6.2 1 .3 1.3.2.4-.1 1.2-.5 1.3-1 .2-.5.2-.9.2-1 0-.1-.2-.2-.4-.3z" fill="#fff"/></svg>
      <span>Owner WA: <span style="color:#161824">+6285723657734</span></span>
    </a>
  </div>
</body>
</html>
`;
    return new Response(html, { headers: { "content-type": "text/html; charset=UTF-8" } });
  }
};
