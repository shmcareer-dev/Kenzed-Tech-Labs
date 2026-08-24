"use client";

import { KzApplyForm } from "@/components/kz/KzApplyForm";
import {
  KzDonut,
  KzLifecycleWheel,
  type KzDonutSlice,
  type KzLifecycleStage,
} from "@/components/kz/KzDiagrams";
import { KzIcon, type KzIconKey } from "@/components/kz/KzIcon";
import { KzScrollSpy } from "@/components/kz/KzScrollSpy";
import { KzGridPattern } from "@/components/kz/motion/KzAmbient";
import { KzFadeUp } from "@/components/kz/motion/KzEntrance";
import { KzCountUp } from "@/components/kz/motion/KzFeedback";
import { KZ_HOVER_GROUP, KzArrowNudge } from "@/components/kz/motion/KzPointer";
import { KzPageHero, KzSectionTitle, KzSphere, KzOrbitDots } from "@/components/kz/primitives";
import { site } from "@/content/site";
import { liveProjects, performers, trainingPrograms } from "@/content/training";

/* The records rendered here come from src/content/training.ts, which is flagged
   as demonstration data — swap in real trainees and projects before launch. */

const programIcons: Record<string, KzIconKey> = {
  "agentic-ai-engineering": "agent",
  "applied-ml-computer-vision": "ml",
  "llm-fine-tuning-llmops": "llm",
  "voice-ai-systems": "voice",
  "product-engineering": "web",
};

const projectTitleById = new Map(liveProjects.map((project) => [project.id, project.title]));

/* Derived rather than written down so the chart can never drift from the
   project list it summarises. */
const domainSlices: KzDonutSlice[] = Array.from(
  liveProjects.reduce(
    (counts, project) => counts.set(project.domain, (counts.get(project.domain) ?? 0) + 1),
    new Map<string, number>()
  ),
  ([label, value]) => ({ label, value })
);

const journeyStages: KzLifecycleStage[] = [
  { label: "Apply & screen", caption: "A short call, not a written test" },
  { label: "Foundations", caption: "Guided theory with daily exercises" },
  { label: "Build lab", caption: "Supervised builds on sample data" },
  { label: "Live project", caption: "You join a real client squad" },
  { label: "Review", caption: "Code review and an assessed defence" },
  { label: "Certificate", caption: "Your entry in the register below" },
];

const applySteps = [
  ["We read it", "Within one business day, by someone on the training team."],
  ["Screening call", "Twenty minutes on what you have built and what you want to build."],
  ["Seat confirmed", "Cohort dates, reading list, and your first exercise."],
];

const registerStats = [
  { value: trainingPrograms.length, label: "Programmes running" },
  { value: liveProjects.length, label: "Live projects on record" },
  { value: performers.length, label: "Trainees credited" },
  { value: domainSlices.length, label: "Industry domains" },
];

export function KzLiveProjects() {
  return (
    <div id="top" style={{ position: "relative" }}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "min(6%, 90px)",
          top: "clamp(140px, 20vh, 200px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <KzSphere size={54} opacity={0.3} />
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "min(4%, 50px)",
          top: "clamp(220px, 34vh, 340px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <KzOrbitDots count={7} radius={22} />
      </div>

      <KzPageHero
        eyebrow="04 / Live projects & training"
        title="Train on live work. Leave with the record."
        lead="Our trainees do not build toy projects. They join a delivery squad on real client work, ship a reviewed contribution, and leave with a certificate and an entry in the register below — a credential someone can actually check."
      />

      <KzScrollSpy
        sections={[
          { id: "top", label: "Live projects & training" },
          { id: "programmes", label: "Training programmes" },
          { id: "journey", label: "The training journey" },
          { id: "apply", label: "Apply now" },
          { id: "register", label: "Projects & performers" },
        ]}
      />

      <section id="programmes" style={{ padding: "0 0 clamp(50px, 7vw, 80px)", background: "var(--bg)" }}>
        <div className="kz-wrap">
          <KzFadeUp>
            <KzSectionTitle style={{ marginBottom: 10 }}>Training programmes</KzSectionTitle>
            <p
              style={{
                color: "var(--mut)",
                maxWidth: "68ch",
                margin: "0 0 22px",
                fontSize: "1rem",
                textAlign: "justify",
              }}
            >
              Every programme ends on a live client project. Cohorts run from our Durgapur
              engineering centre under the same code review, tracing and release discipline our own
              engineers work under — because the work you touch is the work we ship.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, margin: "0 0 28px" }}>
              <a href="#apply" className={`kz-btn kz-btn-primary ${KZ_HOVER_GROUP}`}>
                Apply now<KzArrowNudge>→</KzArrowNudge>
              </a>
              <a href="#register" className="kz-btn kz-btn-ghost">
                See the register
              </a>
            </div>
          </KzFadeUp>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
              gap: 16,
            }}
          >
            {trainingPrograms.map((program, i) => (
              <KzFadeUp key={program.slug} delay={(i % 3) * 90} style={{ height: "100%" }}>
                <div
                  className="kz-card"
                  style={{
                    padding: "clamp(20px, 3vw, 28px)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span className="kz-icon-tile">
                      <KzIcon name={programIcons[program.slug] ?? "sw"} size={20} />
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.66rem",
                        letterSpacing: "0.16em",
                        color: "var(--dim)",
                        marginLeft: "auto",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "clamp(1.05rem, 2.6vw, 1.2rem)",
                      fontWeight: 700,
                      margin: 0,
                      color: "var(--ink)",
                      lineHeight: 1.25,
                    }}
                  >
                    {program.title}
                  </h3>

                  <dl
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 120px), 1fr))",
                      gap: "12px 16px",
                      margin: 0,
                      paddingTop: 4,
                      borderTop: "1px solid var(--line)",
                    }}
                  >
                    {[
                      ["Duration", program.duration],
                      ["Mode", program.mode],
                      ["Level", program.level],
                      ["Seats", program.seats],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="kz-label" style={{ marginBottom: 4 }}>
                          {label}
                        </dt>
                        <dd
                          style={{
                            margin: 0,
                            fontSize: "0.86rem",
                            color: "var(--ink)",
                            lineHeight: 1.45,
                          }}
                        >
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.92rem",
                      color: "var(--mut)",
                      textAlign: "justify",
                    }}
                  >
                    {program.summary}
                  </p>

                  <div>
                    <div className="kz-label" style={{ marginBottom: 10 }}>
                      You will be able to
                    </div>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 9 }}>
                      {program.outcomes.map((outcome) => (
                        <li
                          key={outcome}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "14px 1fr",
                            gap: 10,
                            fontSize: "0.88rem",
                            color: "var(--mut)",
                            lineHeight: 1.5,
                          }}
                        >
                          <span
                            aria-hidden="true"
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "var(--acc)",
                              marginTop: 7,
                            }}
                          />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginTop: "auto", paddingTop: 4 }}>
                    <div className="kz-label" style={{ marginBottom: 10 }}>
                      Tools
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {program.tools.map((tool) => (
                        <span
                          key={tool}
                          className="kz-tag"
                          style={{
                            fontSize: "0.78rem",
                            padding: "6px 11px",
                            borderRadius: 9,
                            background: "var(--card2)",
                            border: "1px solid var(--line)",
                            color: "var(--mut)",
                          }}
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </KzFadeUp>
            ))}
          </div>
        </div>
      </section>

      <section id="journey" style={{ padding: "0 0 clamp(50px, 7vw, 80px)", background: "var(--bg)" }}>
        <div
          className="kz-wrap"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 330px), 1fr))",
            gap: "clamp(28px, 5vw, 56px)",
            alignItems: "center",
          }}
        >
          <KzFadeUp>
            <KzSectionTitle style={{ marginBottom: 10 }}>The training journey</KzSectionTitle>
            <p
              style={{
                color: "var(--mut)",
                margin: "0 0 18px",
                fontSize: "1rem",
                textAlign: "justify",
              }}
            >
              Every trainee travels the same six stages. Nobody joins a client squad until the build
              lab says they are ready, and nobody reaches the register without a reviewed
              contribution and an assessed defence of it. That is what makes the entry worth
              something.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <span className="kz-pill">MENTOR ON THE SQUAD</span>
              <span className="kz-pill">EVERY COMMIT REVIEWED</span>
            </div>
          </KzFadeUp>
          <KzFadeUp delay={90}>
            <KzLifecycleWheel stages={journeyStages} />
          </KzFadeUp>
        </div>
      </section>

      <section
        id="apply"
        style={{ padding: "clamp(20px, 4vw, 30px) 0 clamp(50px, 7vw, 80px)", background: "var(--bg)" }}
      >
        <div
          className="kz-wrap"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: "clamp(24px, 4vw, 48px)",
            alignItems: "start",
          }}
        >
          <KzFadeUp>
            <KzSectionTitle style={{ marginBottom: 10 }}>Apply now</KzSectionTitle>
            <p
              style={{
                color: "var(--mut)",
                margin: "0 0 24px",
                fontSize: "1rem",
                textAlign: "justify",
              }}
            >
              Tell us where you are and what you want to build. The form opens a WhatsApp message to
              our training desk — send it, and we reply within one business day with the next cohort
              date and a slot for a screening call. The call decides the seat, not the form.
            </p>

            {applySteps.map(([title, detail], i) => (
              <div
                key={title}
                className="kz-hover-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px 1fr",
                  gap: 16,
                  padding: "18px 10px",
                  borderTop: "1px solid var(--line)",
                  alignItems: "start",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "1.1rem",
                    color: "var(--acc)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3
                    style={{
                      fontSize: "0.98rem",
                      fontWeight: 700,
                      margin: "0 0 4px",
                      color: "var(--ink)",
                    }}
                  >
                    {title}
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--mut)" }}>{detail}</p>
                </div>
              </div>
            ))}
            <div style={{ borderTop: "1px solid var(--line)" }} />
          </KzFadeUp>

          <KzFadeUp delay={90}>
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: 20,
                padding: "clamp(22px, 3.5vw, 32px)",
              }}
            >
              <KzApplyForm />
            </div>
          </KzFadeUp>
        </div>
      </section>

      <section
        id="register"
        style={{
          padding: "clamp(20px, 4vw, 30px) 0 clamp(70px, 10vw, 120px)",
          background: "var(--bg)",
          position: "relative",
        }}
      >
        <KzGridPattern cell={64} opacity={0.4} fade="center" />
        <div className="kz-wrap" style={{ position: "relative" }}>
          <KzFadeUp>
            <KzSectionTitle style={{ marginBottom: 10 }}>Projects &amp; performers</KzSectionTitle>
            <p
              style={{
                color: "var(--mut)",
                maxWidth: "74ch",
                margin: "0 0 26px",
                fontSize: "1rem",
                textAlign: "justify",
              }}
            >
              This is the credential record. Every live project run with trainees is listed with its
              period and status, and every trainee who contributed is named against the project they
              worked on, with the certificate we issued. Quote a certificate ID and we will confirm
              it.
            </p>
          </KzFadeUp>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
              gap: 12,
              marginBottom: "clamp(32px, 5vw, 52px)",
            }}
          >
            {registerStats.map((stat, i) => (
              <KzFadeUp key={stat.label} delay={(i % 4) * 90} style={{ height: "100%" }}>
                <div className="kz-card" style={{ padding: "20px 18px", height: "100%" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: "clamp(1.8rem, 5vw, 2.4rem)",
                      lineHeight: 1.04,
                      letterSpacing: "-0.035em",
                      color: "var(--ink)",
                      marginBottom: 8,
                    }}
                  >
                    <KzCountUp to={stat.value} duration={700} />
                  </div>
                  <div className="kz-label" style={{ marginBottom: 0 }}>
                    {stat.label}
                  </div>
                </div>
              </KzFadeUp>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: "clamp(28px, 5vw, 56px)",
              alignItems: "center",
              marginBottom: "clamp(32px, 5vw, 52px)",
            }}
          >
            <KzFadeUp>
              <KzDonut slices={domainSlices} title="Live projects by domain" />
            </KzFadeUp>
            <KzFadeUp delay={90}>
              <p
                style={{
                  color: "var(--mut)",
                  margin: 0,
                  fontSize: "0.96rem",
                  textAlign: "justify",
                }}
              >
                Trainees are placed where the work is, not where the syllabus is convenient. That
                means a cohort can end up on a foundry shop floor, a clinic network, or a municipal
                grievance queue — and the constraints of each one are the part they remember long
                after the certificate.
              </p>
            </KzFadeUp>
          </div>

          <KzFadeUp>
            <SubHeading>Live projects</SubHeading>
          </KzFadeUp>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: 16,
              marginBottom: "clamp(40px, 6vw, 64px)",
            }}
          >
            {liveProjects.map((project, i) => {
              const tone = project.status === "Delivered" ? "var(--acc3)" : "var(--acc2)";
              return (
                <KzFadeUp key={project.id} delay={(i % 3) * 90} style={{ height: "100%" }}>
                  <div
                    className="kz-card"
                    style={{
                      padding: "clamp(20px, 3vw, 26px)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 10,
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.68rem",
                          letterSpacing: "0.12em",
                          color: "var(--dim)",
                        }}
                      >
                        {project.id}
                      </span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.62rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          padding: "6px 11px",
                          borderRadius: 999,
                          border: `1px solid ${tone}`,
                          background: "var(--card2)",
                          color: tone,
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: tone,
                            animation:
                              project.status === "In progress" ? "kzPulse 2s infinite" : undefined,
                          }}
                        />
                        {project.status}
                      </span>
                    </div>

                    <h4
                      style={{
                        fontSize: "clamp(1.02rem, 2.4vw, 1.14rem)",
                        fontWeight: 700,
                        margin: 0,
                        color: "var(--ink)",
                        lineHeight: 1.3,
                      }}
                    >
                      {project.title}
                    </h4>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "4px 14px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.68rem",
                        letterSpacing: "0.08em",
                        color: "var(--mut)",
                      }}
                    >
                      <span>{project.domain}</span>
                      <span>{project.period}</span>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        color: "var(--mut)",
                        textAlign: "justify",
                      }}
                    >
                      {project.summary}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        marginTop: "auto",
                        paddingTop: 4,
                      }}
                    >
                      {project.stack.map((item) => (
                        <span
                          key={item}
                          className="kz-tag"
                          style={{
                            fontSize: "0.76rem",
                            padding: "6px 11px",
                            borderRadius: 9,
                            background: "var(--card2)",
                            border: "1px solid var(--line)",
                            color: "var(--mut)",
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </KzFadeUp>
              );
            })}
          </div>

          <KzFadeUp>
            <SubHeading>Performer register</SubHeading>
          </KzFadeUp>

          <KzFadeUp delay={90}>
            <div
              role="region"
              aria-label="Trainee performer register"
              tabIndex={0}
              style={{
                overflowX: "auto",
                border: "1px solid var(--line)",
                borderRadius: 16,
                background: "var(--card)",
                padding: "clamp(16px, 3vw, 24px)",
              }}
            >
              <table
                style={{
                  width: "100%",
                  minWidth: 640,
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <caption
                  style={{
                    captionSide: "top",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.66rem",
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                    color: "var(--acc)",
                    textAlign: "left",
                    paddingBottom: 16,
                  }}
                >
                  Trainees credited on delivered client work
                </caption>
                <thead>
                  <tr>
                    {["Performer", "Programme", "Live project", "Period", "Certificate ID"].map(
                      (heading) => (
                        <th
                          key={heading}
                          scope="col"
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.62rem",
                            fontWeight: 500,
                            letterSpacing: "0.13em",
                            textTransform: "uppercase",
                            color: "var(--dim)",
                            padding: "0 14px 12px 0",
                            borderBottom: "1px solid var(--line2)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {performers.map((performer) => (
                    <tr key={performer.certificateId}>
                      <th
                        scope="row"
                        style={{
                          padding: "18px 14px 18px 0",
                          borderBottom: "1px solid var(--line)",
                          verticalAlign: "top",
                          fontWeight: 400,
                        }}
                      >
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            color: "var(--ink)",
                            marginBottom: 4,
                          }}
                        >
                          {performer.name}
                        </span>
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.8rem",
                            color: "var(--mut)",
                            marginBottom: 8,
                          }}
                        >
                          {performer.role}
                        </span>
                        <span
                          style={{
                            display: "block",
                            maxWidth: "44ch",
                            fontSize: "0.82rem",
                            color: "var(--dim)",
                            lineHeight: 1.55,
                            textAlign: "justify",
                          }}
                        >
                          {performer.highlight}
                        </span>
                      </th>
                      <td
                        style={{
                          padding: "18px 14px 18px 0",
                          borderBottom: "1px solid var(--line)",
                          verticalAlign: "top",
                          fontSize: "0.86rem",
                          color: "var(--mut)",
                        }}
                      >
                        {performer.program}
                      </td>
                      <td
                        style={{
                          padding: "18px 14px 18px 0",
                          borderBottom: "1px solid var(--line)",
                          verticalAlign: "top",
                          fontSize: "0.86rem",
                          color: "var(--ink)",
                        }}
                      >
                        {projectTitleById.get(performer.projectId) ?? "Unlisted project"}
                        <span
                          style={{
                            display: "block",
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.68rem",
                            letterSpacing: "0.1em",
                            color: "var(--dim)",
                            marginTop: 4,
                          }}
                        >
                          {performer.projectId}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "18px 14px 18px 0",
                          borderBottom: "1px solid var(--line)",
                          verticalAlign: "top",
                          fontSize: "0.82rem",
                          color: "var(--mut)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {performer.period}
                      </td>
                      <td
                        style={{
                          padding: "18px 0",
                          borderBottom: "1px solid var(--line)",
                          verticalAlign: "top",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.74rem",
                          letterSpacing: "0.08em",
                          color: "var(--acc)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {performer.certificateId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </KzFadeUp>

          <KzFadeUp delay={180}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "16px 24px",
                marginTop: "clamp(24px, 4vw, 36px)",
              }}
            >
              <p
                style={{
                  flex: "1 1 340px",
                  margin: 0,
                  fontSize: "0.92rem",
                  color: "var(--mut)",
                  textAlign: "justify",
                }}
              >
                Verifying a candidate? Send us the certificate ID and we will confirm the holder, the
                project they worked on, and the dates — no charge, no account needed.
              </p>
              <a
                href={`mailto:${site.email}?subject=Certificate%20verification`}
                className="kz-btn kz-btn-ghost"
              >
                Verify a certificate
              </a>
            </div>
          </KzFadeUp>
        </div>
      </section>
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontSize: "clamp(1.1rem, 2.4vw, 1.5rem)",
        lineHeight: 1.22,
        letterSpacing: "-0.035em",
        color: "var(--ink)",
        margin: "0 0 20px",
      }}
    >
      {children}
    </h3>
  );
}
