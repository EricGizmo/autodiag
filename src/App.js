
import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are an expert automotive diagnostic AI with deep knowledge of car repair, maintenance, and troubleshooting across all makes and models. When a user describes a car problem, you provide a thorough diagnostic response.

ALWAYS respond with ONLY a valid JSON object (no markdown, no backticks, no preamble) in exactly this structure:
{
  "diagnosis": "Clear explanation of what's likely wrong (2-3 sentences)",
  "severity": "low|medium|high|critical",
  "possibleCauses": ["cause 1", "cause 2", "cause 3"],
  "recommendedFixes": [
    {
      "fix": "Fix description",
      "difficulty": "DIY|Mechanic|Specialist",
      "estimatedCost": "$X - $Y",
      "parts": ["part 1", "part 2"],
      "laborHours": "X-Y hours",
      "turnaround": "Same day|1-2 days|3-5 days|1-2 weeks"
    }
  ],
  "urgency": "Drive it to a shop now|Schedule within a week|Schedule within a month|Monitor and maintain",
  "warningIfIgnored": "What happens if this is ignored",
  "proTip": "One expert tip the user might not know",
  "estimatedMileageImpact": "How this affects vehicle longevity if unaddressed"
}

Be specific with costs. Use real market rates for parts and labor ($80-$150/hr for labor at independent shops, $120-$200/hr at dealerships). If the user mentions their car make/model/year, tailor the response to that vehicle.`;

const severityConfig = {
  low: { color: "#4CAF50", bg: "#0a2010", label: "LOW", icon: "●" },
  medium: { color: "#FF9800", bg: "#1a1000", label: "MEDIUM", icon: "◆" },
  high: { color: "#FF5722", bg: "#1a0800", label: "HIGH", icon: "▲" },
  critical: { color: "#F44336", bg: "#1a0000", label: "CRITICAL", icon: "⬛" },
};

const difficultyColor = {
  DIY: "#4CAF50",
  Mechanic: "#FF9800",
  Specialist: "#F44336",
};

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "16px 0" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#FF6B00",
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function DiagnosticCard({ data }) {
  const sev = severityConfig[data.severity] || severityConfig.medium;
  return (
    <div style={{
      background: "#1C1C1C",
      border: `1px solid #333`,
      borderRadius: 2,
      overflow: "hidden",
      marginBottom: 2,
    }}>
      {/* Header bar */}
      <div style={{
        background: sev.bg,
        borderBottom: `2px solid ${sev.color}`,
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: sev.color, fontSize: 18 }}>{sev.icon}</span>
          <span style={{ color: sev.color, fontFamily: "monospace", fontWeight: 700, fontSize: 12, letterSpacing: 3 }}>
            SEVERITY: {sev.label}
          </span>
        </div>
        <span style={{
          background: sev.color,
          color: "#000",
          padding: "3px 10px",
          borderRadius: 2,
          fontFamily: "monospace",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1,
        }}>{data.urgency}</span>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {/* Diagnosis */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: "#FF6B00", fontFamily: "monospace", fontSize: 10, letterSpacing: 3, marginBottom: 8 }}>
            ▸ DIAGNOSIS
          </div>
          <p style={{ color: "#E8E8E8", lineHeight: 1.7, margin: 0, fontSize: 14 }}>{data.diagnosis}</p>
        </div>

        {/* Two-col layout for causes */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          <div>
            <div style={{ color: "#FF6B00", fontFamily: "monospace", fontSize: 10, letterSpacing: 3, marginBottom: 10 }}>
              ▸ POSSIBLE CAUSES
            </div>
            {data.possibleCauses.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                <span style={{ color: "#555", fontFamily: "monospace", fontSize: 11, marginTop: 2, flexShrink: 0 }}>{String(i+1).padStart(2,"0")}.</span>
                <span style={{ color: "#BDBDBD", fontSize: 13, lineHeight: 1.5 }}>{c}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ color: "#FF6B00", fontFamily: "monospace", fontSize: 10, letterSpacing: 3, marginBottom: 10 }}>
              ▸ IF IGNORED
            </div>
            <p style={{ color: "#BDBDBD", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{data.warningIfIgnored}</p>
            <div style={{ marginTop: 12 }}>
              <div style={{ color: "#FF6B00", fontFamily: "monospace", fontSize: 10, letterSpacing: 3, marginBottom: 6 }}>
                ▸ MILEAGE IMPACT
              </div>
              <p style={{ color: "#BDBDBD", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{data.estimatedMileageImpact}</p>
            </div>
          </div>
        </div>

        {/* Repair options */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: "#FF6B00", fontFamily: "monospace", fontSize: 10, letterSpacing: 3, marginBottom: 12 }}>
            ▸ REPAIR OPTIONS
          </div>
          {data.recommendedFixes.map((fix, i) => (
            <div key={i} style={{
              background: "#252525",
              border: "1px solid #333",
              borderRadius: 2,
              padding: "16px 18px",
              marginBottom: 10,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ flex: 1, marginRight: 16 }}>
                  <span style={{
                    color: "#888",
                    fontFamily: "monospace",
                    fontSize: 10,
                    letterSpacing: 2,
                    display: "block",
                    marginBottom: 4,
                  }}>OPTION {i + 1}</span>
                  <span style={{ color: "#E8E8E8", fontSize: 14, fontWeight: 500 }}>{fix.fix}</span>
                </div>
                <span style={{
                  background: difficultyColor[fix.difficulty] + "22",
                  color: difficultyColor[fix.difficulty],
                  border: `1px solid ${difficultyColor[fix.difficulty]}44`,
                  padding: "3px 10px",
                  borderRadius: 2,
                  fontFamily: "monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1,
                  flexShrink: 0,
                }}>{fix.difficulty}</span>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                <div style={{ background: "#1A1A1A", padding: "10px 12px", borderRadius: 2 }}>
                  <div style={{ color: "#555", fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>COST EST.</div>
                  <div style={{ color: "#FF6B00", fontFamily: "monospace", fontSize: 16, fontWeight: 700 }}>{fix.estimatedCost}</div>
                </div>
                <div style={{ background: "#1A1A1A", padding: "10px 12px", borderRadius: 2 }}>
                  <div style={{ color: "#555", fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>LABOR</div>
                  <div style={{ color: "#E8E8E8", fontFamily: "monospace", fontSize: 14, fontWeight: 600 }}>{fix.laborHours}</div>
                </div>
                <div style={{ background: "#1A1A1A", padding: "10px 12px", borderRadius: 2 }}>
                  <div style={{ color: "#555", fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>TURNAROUND</div>
                  <div style={{ color: "#E8E8E8", fontFamily: "monospace", fontSize: 13, fontWeight: 600 }}>{fix.turnaround}</div>
                </div>
              </div>

              {/* Parts */}
              {fix.parts && fix.parts.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ color: "#555", fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>PARTS NEEDED</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {fix.parts.map((p, j) => (
                      <span key={j} style={{
                        background: "#1A1A1A",
                        color: "#9E9E9E",
                        border: "1px solid #333",
                        padding: "3px 10px",
                        borderRadius: 2,
                        fontFamily: "monospace",
                        fontSize: 11,
                      }}>{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pro tip */}
        <div style={{
          background: "linear-gradient(135deg, #1a1000, #0d0d0d)",
          border: "1px solid #FF6B0033",
          borderLeft: "3px solid #FF6B00",
          padding: "14px 18px",
          borderRadius: 2,
        }}>
          <div style={{ color: "#FF6B00", fontFamily: "monospace", fontSize: 10, letterSpacing: 3, marginBottom: 6 }}>
            ⚙ MECHANIC'S TIP
          </div>
          <p style={{ color: "#BDBDBD", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{data.proTip}</p>
        </div>
      </div>
    </div>
  );
}

export default function CarMaintenanceAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const apiMessages = newMessages.map(m => ({
        role: m.role,
        content: m.role === "user" ? m.content : JSON.stringify(m.data),
      }));

const response = await fetch("/api/diagnose", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: apiMessages,
  }),
});

      const data = await response.json();
      const rawText = data.content?.map(b => b.text || "").join("") || "";
      const clean = rawText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setMessages(prev => [...prev, { role: "assistant", data: parsed }]);
    } catch (err) {
      setError("Diagnostic failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const examples = [
    "My 2018 Honda Accord makes a grinding noise when I brake",
    "Check engine light on, car shaking at idle",
    "2015 Toyota Camry — AC blows warm air only",
    "Car won't start, just clicking sound when I turn key",
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#111111",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        textarea:focus { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1C1C1C; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        textarea { resize: none; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #222",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#0D0D0D",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 36,
            height: 36,
            background: "#FF6B00",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}>🔧</div>
          <div>
            <div style={{ color: "#E8E8E8", fontWeight: 700, fontSize: 15, letterSpacing: 0.5 }}>AutoDiag AI</div>
            <div style={{ color: "#555", fontFamily: "monospace", fontSize: 10, letterSpacing: 2 }}>VEHICLE DIAGNOSTIC SYSTEM</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4CAF50", animation: "pulse 2s infinite" }} />
          <span style={{ color: "#555", fontFamily: "monospace", fontSize: 10, letterSpacing: 1 }}>ONLINE</span>
        </div>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", maxWidth: 860, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚗</div>
            <h2 style={{ color: "#E8E8E8", fontWeight: 700, fontSize: 22, margin: "0 0 8px" }}>
              Describe your car problem
            </h2>
            <p style={{ color: "#555", fontSize: 14, margin: "0 0 40px", lineHeight: 1.6 }}>
              Include your make, model, year and symptoms for the most accurate diagnosis.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 600, margin: "0 auto" }}>
              {examples.map((ex, i) => (
                <button key={i} onClick={() => setInput(ex)} style={{
                  background: "#1C1C1C",
                  border: "1px solid #2A2A2A",
                  borderRadius: 2,
                  padding: "12px 16px",
                  color: "#9E9E9E",
                  fontSize: 12,
                  textAlign: "left",
                  cursor: "pointer",
                  lineHeight: 1.5,
                  transition: "border-color 0.2s, color 0.2s",
                }}
                  onMouseEnter={e => { e.target.style.borderColor = "#FF6B0066"; e.target.style.color = "#E8E8E8"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "#2A2A2A"; e.target.style.color = "#9E9E9E"; }}
                >{ex}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            {msg.role === "user" && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                <div style={{
                  background: "#1E1E1E",
                  border: "1px solid #2A2A2A",
                  borderRadius: 2,
                  padding: "12px 18px",
                  maxWidth: "75%",
                  color: "#E8E8E8",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}>
                  <div style={{ color: "#FF6B00", fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>YOU</div>
                  {msg.content}
                </div>
              </div>
            )}
            {msg.role === "assistant" && msg.data && (
              <DiagnosticCard data={msg.data} />
            )}
          </div>
        ))}

        {loading && (
          <div style={{
            background: "#1C1C1C",
            border: "1px solid #2A2A2A",
            borderLeft: "3px solid #FF6B00",
            padding: "4px 20px 4px",
            borderRadius: 2,
          }}>
            <div style={{ color: "#555", fontFamily: "monospace", fontSize: 9, letterSpacing: 2, marginBottom: -6, paddingTop: 8 }}>RUNNING DIAGNOSTIC</div>
            <TypingDots />
          </div>
        )}

        {error && (
          <div style={{
            background: "#1a0000",
            border: "1px solid #F44336",
            borderRadius: 2,
            padding: "12px 18px",
            color: "#F44336",
            fontFamily: "monospace",
            fontSize: 12,
          }}>{error}</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{
        borderTop: "1px solid #222",
        background: "#0D0D0D",
        padding: "16px 20px",
        position: "sticky",
        bottom: 0,
      }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          {messages.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              {["What parts do I need?", "Is this safe to drive?", "Can I DIY this?", "Get a second opinion"].map((q) => (
                <button key={q} onClick={() => setInput(q)} style={{
                  background: "transparent",
                  border: "1px solid #2A2A2A",
                  borderRadius: 2,
                  padding: "4px 12px",
                  color: "#555",
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: "monospace",
                  letterSpacing: 0.5,
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => { e.target.style.borderColor = "#FF6B0055"; e.target.style.color = "#FF6B00"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "#2A2A2A"; e.target.style.color = "#555"; }}
                >{q}</button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your car problem... (e.g. '2019 Ford F-150, engine light on, rough idle when stopped')"
              rows={3}
              style={{
                flex: 1,
                background: "#1C1C1C",
                border: "1px solid #2A2A2A",
                borderRadius: 2,
                padding: "12px 16px",
                color: "#E8E8E8",
                fontSize: 14,
                lineHeight: 1.5,
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#FF6B0077"}
              onBlur={e => e.target.style.borderColor = "#2A2A2A"}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading ? "#FF6B00" : "#222",
                border: "none",
                borderRadius: 2,
                width: 48,
                height: 48,
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                fontSize: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
            >
              {loading ? "⏳" : "→"}
            </button>
          </div>
          <div style={{ color: "#333", fontFamily: "monospace", fontSize: 9, letterSpacing: 1, marginTop: 8, textAlign: "center" }}>
            FOR REFERENCE ONLY · ALWAYS CONSULT A QUALIFIED MECHANIC · PRESS ENTER TO DIAGNOSE
          </div>
        </div>
      </div>
    </div>
  );
}
