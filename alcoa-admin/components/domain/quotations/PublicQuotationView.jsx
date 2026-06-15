"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(amount, currency = "AED") {
  return `${currency} ${Number(amount || 0).toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const TERMINAL = new Set(["approved", "rejected", "converted"]);

/**
 * Customer-facing read view for a quotation, fetched by `publicToken`.
 * Auto-runs the action passed in the email link (`?action=accept|reject`)
 * once, then offers the buttons interactively.
 */
export function PublicQuotationView({ token, initialAction }) {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(null);
  const [decision, setDecision] = useState(null);
  const [actionError, setActionError] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const initialAutoRanRef = useRef(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/public/quotations/${token}`, { cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
        if (!json.success) {
          setLoadError(json.error || "Could not load this quotation.");
        } else {
          setData(json.data);
          if (TERMINAL.has(json.data.status)) setDecision(json.data.status);
        }
      } catch (err) {
        if (alive) setLoadError(err.message || "Network error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  const status = decision || data?.status;
  const isExpired = useMemo(() => {
    if (!data?.validUntil) return false;
    return new Date(data.validUntil) < new Date();
  }, [data?.validUntil]);

  async function decide(action, payload) {
    setActionPending(action);
    setActionError("");
    try {
      const res = await fetch(`/api/public/quotations/${token}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload || {}),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed");
      setDecision(json.data.status);
      setShowRejectBox(false);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionPending(null);
    }
  }

  // Auto-fire the email link action exactly once after first load.
  useEffect(() => {
    if (!data || initialAutoRanRef.current) return;
    if (!initialAction) return;
    if (TERMINAL.has(data.status)) return;
    initialAutoRanRef.current = true;
    if (initialAction === "accept") decide("accept");
    if (initialAction === "reject") setShowRejectBox(true);
  }, [data, initialAction]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <main style={containerStyle}>
        <div style={{ ...cardStyle, textAlign: "center" }}>Loading quotation…</div>
      </main>
    );
  }
  if (loadError || !data) {
    return (
      <main style={containerStyle}>
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <h1 style={titleStyle}>Quotation unavailable</h1>
          <p style={mutedStyle}>{loadError || "This link is invalid."}</p>
        </div>
      </main>
    );
  }

  return (
    <main style={containerStyle}>
      <div style={cardStyle}>
        <header style={headerStyle}>
          <div>
            <p style={pillStyle}>QUOTATION</p>
            <h1 style={titleStyle}>{data.quoteNumber}</h1>
          </div>
          <StatusBadge status={status} />
        </header>

        <section style={twoColStyle}>
          <Block label="Bill to">
            <strong style={{ color: "#0f172a" }}>{data.customerName}</strong>
            {data.customerAddress && (
              <p style={{ ...mutedStyle, marginTop: 6, whiteSpace: "pre-line" }}>{data.customerAddress}</p>
            )}
            {data.customerTRN && (
              <p style={{ ...mutedStyle, marginTop: 6 }}>TRN: {data.customerTRN}</p>
            )}
          </Block>
          <Block label="Quote details">
            <Row k="Quote date" v={formatDate(data.quoteDate)} />
            <Row
              k="Valid until"
              v={<span style={{ color: isExpired ? "#dc2626" : "#0f172a" }}>{formatDate(data.validUntil)}</span>}
            />
            <Row k="Type" v={<span style={{ textTransform: "capitalize" }}>{data.quoteType}</span>} />
          </Block>
        </section>

        {data.subject && (
          <div style={subjectStyle}>
            <strong>Subject:</strong> {data.subject}
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={{ ...thStyle, textAlign: "left" }}>Description</th>
                <th style={thStyle}>Qty</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Rate</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(data.items || []).map((it, i) => (
                <tr key={it._id || i} style={{ background: i % 2 ? "#f8fafc" : "#fff" }}>
                  <td style={tdStyle}>{i + 1}</td>
                  <td style={tdStyle}>
                    <strong>{it.equipmentType}</strong>
                    {it.description && <div style={{ ...mutedStyle, fontSize: 12 }}>{it.description}</div>}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    {it.quantity} {it.unit || "Nos"}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>{formatCurrency(it.ratePerUnit, data.currency)}</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>
                    {formatCurrency(it.subtotal, data.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={totalsStyle}>
          <Row k="Subtotal" v={formatCurrency(data.subtotal, data.currency)} />
          {data.deliveryCharges > 0 && (
            <Row k="Delivery" v={formatCurrency(data.deliveryCharges, data.currency)} />
          )}
          {data.installationCharges > 0 && (
            <Row k="Installation" v={formatCurrency(data.installationCharges, data.currency)} />
          )}
          {data.discount > 0 && (
            <Row k="Discount" v={`- ${formatCurrency(data.discount, data.currency)}`} />
          )}
          <Row k={`VAT (${data.vatPercentage}%)`} v={formatCurrency(data.vatAmount, data.currency)} />
          <hr style={{ border: 0, borderTop: "1px solid #e2e8f0", margin: "8px 0" }} />
          <Row
            k={<strong>Total</strong>}
            v={<strong style={{ color: "#1D3A6C" }}>{formatCurrency(data.totalAmount, data.currency)}</strong>}
          />
        </div>

        {data.paymentTerms && (
          <p style={{ ...mutedStyle, fontSize: 12 }}>
            <strong>Payment terms:</strong> {data.paymentTerms}
          </p>
        )}
        {data.deliveryTerms && (
          <p style={{ ...mutedStyle, fontSize: 12 }}>
            <strong>Delivery terms:</strong> {data.deliveryTerms}
          </p>
        )}
        {data.notes && (
          <div style={notesStyle}>
            <p style={{ margin: 0, fontWeight: 700, color: "#1D3A6C", fontSize: 12, textTransform: "uppercase" }}>
              Notes
            </p>
            <p style={{ margin: "6px 0 0", whiteSpace: "pre-line", fontSize: 13 }}>{data.notes}</p>
          </div>
        )}

        <ActionPanel
          status={status}
          isExpired={isExpired}
          actionPending={actionPending}
          actionError={actionError}
          showRejectBox={showRejectBox}
          rejectNote={rejectNote}
          setRejectNote={setRejectNote}
          onAccept={() => decide("accept")}
          onShowReject={() => {
            setShowRejectBox(true);
            setActionError("");
          }}
          onCancelReject={() => {
            setShowRejectBox(false);
            setRejectNote("");
            setActionError("");
          }}
          onConfirmReject={() => decide("reject", { note: rejectNote })}
        />
      </div>
    </main>
  );
}

function StatusBadge({ status }) {
  const map = {
    draft: { label: "Draft", bg: "#e2e8f0", fg: "#0f172a" },
    sent: { label: "Sent", bg: "#dbeafe", fg: "#1e40af" },
    viewed: { label: "Viewed", bg: "#ede9fe", fg: "#5b21b6" },
    approved: { label: "Approved", bg: "#dcfce7", fg: "#166534" },
    rejected: { label: "Rejected", bg: "#fee2e2", fg: "#991b1b" },
    expired: { label: "Expired", bg: "#fef3c7", fg: "#92400e" },
    converted: { label: "Converted", bg: "#bbf7d0", fg: "#166534" },
  };
  const s = map[status] || map.draft;
  return (
    <span
      style={{
        background: s.bg,
        color: s.fg,
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.4,
        textTransform: "uppercase",
      }}
    >
      {s.label}
    </span>
  );
}

function ActionPanel({
  status,
  isExpired,
  actionPending,
  actionError,
  showRejectBox,
  rejectNote,
  setRejectNote,
  onAccept,
  onShowReject,
  onCancelReject,
  onConfirmReject,
}) {
  if (status === "approved") {
    return (
      <div style={{ ...resultBox, background: "#dcfce7", color: "#166534" }}>
        Thank you — this quotation has been <strong>accepted</strong>. Our team will be in touch shortly.
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div style={{ ...resultBox, background: "#fee2e2", color: "#991b1b" }}>
        This quotation has been marked as <strong>rejected</strong>. Reach out to us if you'd like a revised offer.
      </div>
    );
  }
  if (status === "converted") {
    return (
      <div style={{ ...resultBox, background: "#dcfce7", color: "#166534" }}>
        This quotation has already been <strong>converted</strong> to a sales order.
      </div>
    );
  }
  if (isExpired) {
    return (
      <div style={{ ...resultBox, background: "#fef3c7", color: "#92400e" }}>
        This quotation has expired. Please contact us for a renewed offer.
      </div>
    );
  }

  return (
    <div style={{ ...resultBox, background: "#f8fafc", color: "#0f172a" }}>
      <p style={{ margin: 0, fontWeight: 600 }}>Please review and confirm this quotation:</p>
      {!showRejectBox && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <button
            type="button"
            onClick={onAccept}
            disabled={!!actionPending}
            style={{ ...btnPrimary, opacity: actionPending ? 0.7 : 1 }}
          >
            {actionPending === "accept" ? "Accepting…" : "Accept Quotation"}
          </button>
          <button
            type="button"
            onClick={onShowReject}
            disabled={!!actionPending}
            style={btnDanger}
          >
            Reject
          </button>
        </div>
      )}
      {showRejectBox && (
        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Optional — let us know why:
          </label>
          <textarea
            rows={3}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            style={textareaStyle}
            placeholder="Price too high, timing isn't right, etc."
          />
          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onConfirmReject}
              disabled={!!actionPending}
              style={btnDanger}
            >
              {actionPending === "reject" ? "Submitting…" : "Confirm rejection"}
            </button>
            <button type="button" onClick={onCancelReject} style={btnGhost} disabled={!!actionPending}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {actionError && (
        <p style={{ marginTop: 10, color: "#991b1b", fontSize: 13 }}>{actionError}</p>
      )}
    </div>
  );
}

function Block({ label, children }) {
  return (
    <div style={blockStyle}>
      <div style={blockLabelStyle}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 13 }}>
      <span style={{ color: "#64748b" }}>{k}</span>
      <span style={{ fontWeight: 600 }}>{v}</span>
    </div>
  );
}

const containerStyle = {
  minHeight: "100vh",
  background: "#e8eef5",
  padding: "24px 12px",
  fontFamily:
    "Inter,ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif",
};
const cardStyle = {
  maxWidth: 760,
  margin: "0 auto",
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 4px 24px rgba(29,58,108,0.12)",
  border: "1px solid #b8c9dc",
  padding: "24px",
};
const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 20,
  flexWrap: "wrap",
};
const titleStyle = { margin: 0, fontSize: 24, color: "#0f172a", letterSpacing: 0.2 };
const pillStyle = {
  margin: 0,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.12em",
  color: "#64748b",
};
const twoColStyle = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  marginBottom: 16,
};
const blockStyle = { padding: 12, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13 };
const blockLabelStyle = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "#64748b",
  fontWeight: 700,
  marginBottom: 8,
};
const subjectStyle = {
  background: "#eef3f9",
  borderLeft: "4px solid #1D3A6C",
  padding: "12px 16px",
  borderRadius: 6,
  marginBottom: 16,
  fontSize: 13,
};
const tableStyle = { width: "100%", borderCollapse: "collapse", marginBottom: 16, fontSize: 13 };
const thStyle = {
  padding: "10px 12px",
  background: "#1D3A6C",
  color: "#fff",
  fontSize: 12,
  textAlign: "center",
};
const tdStyle = { padding: "10px 12px", borderBottom: "1px solid #e2e8f0" };
const totalsStyle = {
  marginLeft: "auto",
  maxWidth: 320,
  marginBottom: 16,
};
const notesStyle = {
  marginTop: 12,
  background: "#eef3f9",
  border: "1px solid #b8c9dc",
  padding: "12px 14px",
  borderRadius: 8,
};
const resultBox = {
  marginTop: 18,
  padding: 16,
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.06)",
};
const btnPrimary = {
  background: "#16a34a",
  color: "#fff",
  border: 0,
  padding: "10px 22px",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};
const btnDanger = {
  background: "#dc2626",
  color: "#fff",
  border: 0,
  padding: "10px 22px",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};
const btnGhost = {
  background: "#fff",
  color: "#0f172a",
  border: "1px solid #e2e8f0",
  padding: "10px 22px",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};
const textareaStyle = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  padding: 10,
  fontSize: 14,
  fontFamily: "inherit",
  resize: "vertical",
};
const mutedStyle = { color: "#64748b" };
