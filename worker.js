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
    body { margin:0; background:#181828; font-family:'Poppins',Arial,sans-serif; min-height:100vh; color:#fff;}
    .header {background:#2196f3;color:#fff;text-align:center;padding:32px 8px 12px 8px;font-size:2rem;font-weight:700;
    border-bottom-left-radius:30px;border-bottom-right-radius:30px;box-shadow:0 4px 16px 0 rgba(33,150,243,0.2);letter-spacing:3px;}
    .subtitle{text-align:center;margin-top:6px;color:#cbe8ff;font-size:1.05rem;font-weight:400;margin-bottom:18px;}
    .wildcard-list-container{max-width:450px;margin:0 auto;padding:16px;}
    .wildcard-list{background:#111;border-radius:18px;box-shadow:0 2px 8px 0 rgba(0,0,0,0.18);padding:18px 10px;margin-top:10px;}
    .wildcard-row{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #333;padding:10px 0 10px 0;font-size:1.08rem;}
    .wildcard-row:last-child{border-bottom:none;}
    .badge{background:#1de9b6;color:#111;border-radius:18px;padding:2px 14px 2px 14px;font-size:0.93em;font-weight:500;margin-left:10px;box-shadow:0 1px 4px rgba(29,233,182,0.12);letter-spacing:1px;}
    @media (max-width:600px){
      .header{font-size:1.3rem;padding:22px 4px 8px 4px;}
      .wildcard-list-container{max-width:99vw;padding:8px;}
      .wildcard-list{padding:12px 5px;}
      .wildcard-row{font-size:0.98rem;}
    }
  </style>
</head>
<body>
  <div class="header">DIANA STORE</div>
  <div class="subtitle">Wildcard domain aktif untuk <b>${host}</b></div>
  <div class="wildcard-list-container">
    <div class="wildcard-list">
      <div class="wildcard-row">
        <span>🟢 ${wildcard}</span>
        <span class="badge">Aktif</span>
      </div>
    </div>
  </div>
</body>
</html>
`;
    return new Response(html, { headers: { "content-type": "text/html; charset=UTF-8" } });
  }
};
