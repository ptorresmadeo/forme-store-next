function Footer() {
  return (
    <footer role="contentinfo">
      <div className="footer-brand">
        <img src="/logo.png" alt="" className="footer-logo" aria-hidden="true" />
        <span>FOR ME STUDIOS © 2026</span>
      </div>
      <div className="footer-links">
        <a href="https://instagram.com" aria-label="Instagram">IG</a>
        <a href="https://tiktok.com" aria-label="TikTok">TK</a>
        <a href="https://whatsapp.com" aria-label="WhatsApp">WA</a>
      </div>
    </footer>
  );
}

export default Footer;