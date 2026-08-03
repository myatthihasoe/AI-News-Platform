import styles from "./news-details.module.css";

export function NewsletterBanner() {
  return (
    <section className={styles.newsletter} aria-labelledby="newsletter-heading">
      <div>
        <h2 id="newsletter-heading">Stay Informed. Stay Balanced.</h2>
        <p>Get the top stories and bias analysis delivered to your inbox.</p>
      </div>
      <div className={styles.newsletterControls} role="group" aria-label="Newsletter preview controls">
        <label className={styles.srOnly} htmlFor="newsletter-email">Email address</label>
        <input
          aria-describedby="newsletter-preview-note"
          id="newsletter-email"
          placeholder="Enter your email"
          readOnly
          type="email"
        />
        <button type="button" aria-describedby="newsletter-preview-note">Subscribe</button>
        <span className={styles.srOnly} id="newsletter-preview-note">Newsletter signup is not active in this preview.</span>
      </div>
    </section>
  );
}
