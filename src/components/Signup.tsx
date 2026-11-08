import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check } from "@phosphor-icons/react";
export default function Signup({ minimal = false }: { minimal?: boolean }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const endpoint = import.meta.env.VITE_NEWSLETTER_ENDPOINT;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || !consent) {
      setStatus("error");
      setMessage("Enter a valid email and agree to receive drop updates.");
      return;
    }
    if (!endpoint) {
      setStatus("error");
      setMessage("Signups are not open yet. Please check back soon.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), consent: true }),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error();
      setStatus("success");
      setMessage(
        "You’re on the list. We’ll be in touch when the drop is ready.",
      );
    } catch {
      setStatus("error");
      setMessage("We couldn’t save your signup. Please try again shortly.");
    }
  }
  if (status === "success")
    return (
      <div className="signup-success" role="status">
        <Check size={24} />
        <p>{message}</p>
      </div>
    );
  return (
    <form className="signup" onSubmit={submit} noValidate>
      <label htmlFor="email" className={minimal ? "sr-only" : undefined}>
        {minimal ? "Email address" : "Get the first word."}
      </label>
      <div className="email-row">
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby="signup-message"
          title={!endpoint ? "Email signup opens soon" : undefined}
          required
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading" || !endpoint}
          aria-label={
            endpoint ? "Sign up for drop updates" : "Email signup opens soon"
          }
        >
          {status === "loading" ? "Sending…" : <ArrowUpRight size={23} />}
        </button>
      </div>
      {(!minimal || email.length > 0 || status === "error") && (
        <label className="consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
            disabled={status === "loading"}
          />
          <span>
            I agree to receive outaflow drop updates by email. Unsubscribe
            anytime.
          </span>
        </label>
      )}
      <p id="signup-message" className="form-message" role="status">
        {message || (!minimal && !endpoint ? "Email signup opens soon." : "")}
      </p>
    </form>
  );
}
