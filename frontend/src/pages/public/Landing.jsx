import { Link } from 'react-router-dom'

const features = [
  {
    number: '01',
    icon: 'bi-stars',
    title: 'AI Skill Mapping',
    text: 'Transform resumes, projects and certifications into a structured skill profile.',
  },
  {
    number: '02',
    icon: 'bi-diagram-3',
    title: 'Smart Matching',
    text: 'Connect student capabilities with relevant jobs, internships and learning paths.',
  },
  {
    number: '03',
    icon: 'bi-graph-up-arrow',
    title: 'Skill Gap Intelligence',
    text: 'Understand which skills are missing and what to learn next for your career goals.',
  },
]

export default function Landing() {
  return (
    <div className="landing-pro">

      {/* ================= HERO ================= */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#f8f9ff',
        }}
      >

        {/* Background decoration */}
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(80,80,255,.12) 0%, rgba(80,80,255,0) 70%)',
            top: -280,
            right: -180,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            width: 450,
            height: 450,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(0,190,220,.08) 0%, rgba(0,190,220,0) 70%)',
            bottom: -220,
            left: -150,
            pointerEvents: 'none',
          }}
        />

        <div className="container position-relative">

          <div
            className="row align-items-center"
            style={{ minHeight: 690 }}
          >

            {/* ================= LEFT SIDE ================= */}
            <div className="col-lg-6 py-5">

              {/* AI badge */}
              <div
                className="d-inline-flex align-items-center gap-2 mb-4"
                style={{
                  padding: '7px 12px',
                  borderRadius: 30,
                  background: '#fff',
                  border: '1px solid #e3e5f0',
                  color: '#4c51e8',
                  fontSize: 12,
                  fontWeight: 600,
                  boxShadow: '0 5px 20px rgba(30,30,80,.05)',
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#22c55e',
                  }}
                />

                AI-powered academic & career platform
              </div>


              {/* Main heading */}
              <h1
                style={{
                  fontSize: 'clamp(3.1rem, 5.5vw, 5rem)',
                  lineHeight: 1.01,
                  letterSpacing: '-3.5px',
                  fontWeight: 700,
                  color: '#11142d',
                  maxWidth: 700,
                  marginBottom: 28,
                }}
              >
                Turn skills into
                <br />

                <span
                  style={{
                    background:
                      'linear-gradient(90deg, #2525df, #6464ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  real opportunities.
                </span>
              </h1>


              {/* Description */}
              <p
                style={{
                  color: '#656b82',
                  fontSize: 17,
                  lineHeight: 1.75,
                  maxWidth: 600,
                  marginBottom: 34,
                }}
              >
                A unified platform connecting students, academicians and
                companies through intelligent skill mapping, career guidance,
                internships, jobs and academic collaboration.
              </p>


              {/* Buttons */}
              <div className="d-flex flex-wrap align-items-center gap-3">

                <Link
                  to="/register"
                  className="text-decoration-none d-flex align-items-center"
                  style={{
                    background: '#1717d4',
                    color: '#fff',
                    padding: '15px 23px',
                    borderRadius: 11,
                    fontWeight: 600,
                    fontSize: 15,
                    boxShadow: '0 12px 30px rgba(23,23,212,.23)',
                  }}
                >
                  Create your profile
                  <i className="bi bi-arrow-right ms-3"></i>
                </Link>

                <Link
                  to="/opportunities"
                  className="text-decoration-none d-flex align-items-center"
                  style={{
                    color: '#1b1e35',
                    padding: '14px 21px',
                    borderRadius: 11,
                    border: '1px solid #dfe1eb',
                    background: '#fff',
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  Explore opportunities
                </Link>

              </div>


              {/* Trust line */}
              <div
                className="d-flex align-items-center gap-3 mt-5"
                style={{
                  color: '#85899b',
                  fontSize: 13,
                }}
              >

                <div className="d-flex">

                  <span
                    className="rounded-circle bg-white border d-flex align-items-center justify-content-center"
                    style={{
                      width: 31,
                      height: 31,
                      marginRight: -7,
                    }}
                  >
                    <i className="bi bi-mortarboard-fill text-primary"></i>
                  </span>

                  <span
                    className="rounded-circle bg-white border d-flex align-items-center justify-content-center"
                    style={{
                      width: 31,
                      height: 31,
                      marginRight: -7,
                    }}
                  >
                    <i className="bi bi-person-workspace text-primary"></i>
                  </span>

                  <span
                    className="rounded-circle bg-white border d-flex align-items-center justify-content-center"
                    style={{
                      width: 31,
                      height: 31,
                    }}
                  >
                    <i className="bi bi-building text-primary"></i>
                  </span>

                </div>

                <span>
                  Built for students, academicians & companies
                </span>

              </div>

            </div>


            {/* ================= RIGHT SIDE ================= */}
            <div className="col-lg-6 py-5">

              <div
                style={{
                  position: 'relative',
                  maxWidth: 570,
                  margin: '0 auto',
                }}
              >

                {/* AI floating badge */}
                <div
                  style={{
                    position: 'absolute',
                    zIndex: 4,
                    top: -22,
                    left: -22,
                    background: '#fff',
                    border: '1px solid #e7e8f0',
                    borderRadius: 13,
                    padding: '12px 15px',
                    boxShadow: '0 18px 45px rgba(20,25,70,.12)',
                  }}
                >

                  <div className="d-flex align-items-center gap-2">

                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        background: '#e9eaff',
                        color: '#3535e8',
                      }}
                    >
                      <i className="bi bi-stars"></i>
                    </div>

                    <div>

                      <div
                        style={{
                          fontSize: 11,
                          color: '#85899b',
                        }}
                      >
                        AI Analysis
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#171a31',
                        }}
                      >
                        Profile analyzed
                      </div>

                    </div>

                  </div>

                </div>


                {/* Main dashboard */}
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 22,
                    border: '1px solid #e2e4ee',
                    boxShadow: '0 30px 80px rgba(35,40,90,.14)',
                    overflow: 'hidden',
                  }}
                >

                  {/* Browser header */}
                  <div
                    className="d-flex align-items-center justify-content-between px-4"
                    style={{
                      height: 54,
                      borderBottom: '1px solid #eceef4',
                    }}
                  >

                    <div className="d-flex gap-1">

                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#e3e4ea',
                        }}
                      />

                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#e3e4ea',
                        }}
                      />

                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#e3e4ea',
                        }}
                      />

                    </div>

                    <span
                      style={{
                        fontSize: 11,
                        color: '#a0a4b5',
                      }}
                    >
                      student / dashboard
                    </span>

                    <i
                      className="bi bi-three-dots"
                      style={{
                        color: '#a0a4b5',
                      }}
                    />

                  </div>


                  <div className="p-4">

                    {/* Dashboard title */}
                    <div className="d-flex justify-content-between align-items-start mb-4">

                      <div>

                        <div
                          style={{
                            color: '#9296a8',
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                          }}
                        >
                          Placement readiness
                        </div>

                        <div
                          style={{
                            fontSize: 25,
                            fontWeight: 700,
                            color: '#16192f',
                            marginTop: 4,
                          }}
                        >
                          Your career snapshot
                        </div>

                      </div>

                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: '#eff0ff',
                          color: '#3535e8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <i className="bi bi-graph-up-arrow"></i>
                      </div>

                    </div>


                    {/* Main score */}
                    <div
                      className="d-flex align-items-center gap-4 mb-4 p-3"
                      style={{
                        borderRadius: 14,
                        background: '#f8f8fc',
                      }}
                    >

                      <div
                        style={{
                          width: 76,
                          height: 76,
                          borderRadius: '50%',
                          background:
                            'conic-gradient(#3737ed 0 84%, #e8e9f0 84% 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >

                        <div
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: '#fff',
                            fontWeight: 700,
                            fontSize: 18,
                            color: '#181b31',
                          }}
                        >
                          84%
                        </div>

                      </div>

                      <div>

                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: '#191c32',
                          }}
                        >
                          Strong profile match
                        </div>

                        <div
                          style={{
                            color: '#85899b',
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          Based on your current skills
                        </div>

                      </div>

                    </div>


                    {/* Metrics */}
                    <DashboardMetric
                      label="Skill match"
                      value="84%"
                      width="84%"
                    />

                    <DashboardMetric
                      label="Resume strength"
                      value="71%"
                      width="71%"
                    />

                    <DashboardMetric
                      label="Interview readiness"
                      value="62%"
                      width="62%"
                    />


                    {/* AI recommendation */}
                    <div
                      className="d-flex gap-3 mt-4 p-3"
                      style={{
                        borderRadius: 13,
                        background: '#f3f4ff',
                      }}
                    >

                      <i
                        className="bi bi-lightbulb-fill"
                        style={{
                          color: '#5656ed',
                          marginTop: 2,
                        }}
                      />

                      <div>

                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#272a48',
                          }}
                        >
                          AI recommendation
                        </div>

                        <div
                          style={{
                            fontSize: 11,
                            color: '#747991',
                            marginTop: 3,
                          }}
                        >
                          Strengthen React and Machine Learning skills
                          to improve your matching score.
                        </div>

                      </div>

                    </div>

                  </div>

                </div>


                {/* Floating opportunity */}
                <div
                  className="d-none d-md-block"
                  style={{
                    position: 'absolute',
                    right: -25,
                    bottom: -25,
                    background: '#fff',
                    border: '1px solid #e4e5ed',
                    borderRadius: 14,
                    padding: '13px 16px',
                    boxShadow: '0 18px 45px rgba(20,25,70,.13)',
                  }}
                >

                  <div
                    style={{
                      fontSize: 10,
                      color: '#8b8fa1',
                      marginBottom: 3,
                    }}
                  >
                    MATCHED OPPORTUNITY
                  </div>

                  <div
                    className="d-flex align-items-center gap-2"
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#171a31',
                    }}
                  >

                    <i
                      className="bi bi-briefcase-fill"
                      style={{
                        color: '#3535e8',
                      }}
                    />

                    Machine Learning Intern

                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: '#85899b',
                      marginTop: 3,
                    }}
                  >
                    92% profile match
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= STATS ================= */}
      <section
        style={{
          background: '#11142d',
          color: '#fff',
        }}
      >

        <div className="container">

          <div className="row g-0">

            <Stat
              number="01"
              title="Student"
              text="Build skills & discover opportunities"
            />

            <Stat
              number="02"
              title="Academician"
              text="Guide students & manage programs"
            />

            <Stat
              number="03"
              title="Company"
              text="Find talent & publish opportunities"
            />

            <Stat
              number="AI"
              title="Intelligence"
              text="Turn data into actionable insights"
            />

          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}
      <section className="py-5 bg-white">

        <div className="container py-lg-5">

          <div className="row align-items-end mb-5">

            <div className="col-lg-7">

              <div
                style={{
                  color: '#4b4bea',
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1.4,
                }}
              >
                Platform intelligence
              </div>

              <h2
                className="mt-2 mb-3"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                  letterSpacing: '-1.8px',
                  fontWeight: 700,
                  color: '#11142d',
                }}
              >
                From profile to
                <br />
                opportunity.
              </h2>

            </div>

            <div className="col-lg-5">

              <p
                className="mb-0"
                style={{
                  color: '#74798e',
                  lineHeight: 1.8,
                }}
              >
                The platform brings skills, education and opportunities
                together so every participant can make better-informed
                career and collaboration decisions.
              </p>

            </div>

          </div>


          <div className="row g-4">

            {features.map((feature) => (

              <div
                className="col-lg-4"
                key={feature.number}
              >

                <div
                  className="h-100"
                  style={{
                    padding: 30,
                    border: '1px solid #e6e7ef',
                    borderRadius: 18,
                    background: '#fff',
                  }}
                >

                  <div
                    className="d-flex justify-content-between align-items-center mb-5"
                  >

                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: '#f0f0ff',
                        color: '#3838e8',
                      }}
                    >
                      <i className={`bi ${feature.icon} fs-5`}></i>
                    </div>

                    <span
                      style={{
                        color: '#b3b6c4',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {feature.number}
                    </span>

                  </div>

                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: '#171a31',
                    }}
                  >
                    {feature.title}
                  </h3>

                  <p
                    className="mb-0"
                    style={{
                      color: '#777c91',
                      fontSize: 14,
                      lineHeight: 1.75,
                    }}
                  >
                    {feature.text}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ================= FINAL CTA ================= */}
      <section
        className="py-5"
        style={{
          background: '#f7f8fc',
        }}
      >

        <div className="container py-lg-5">

          <div
            className="position-relative overflow-hidden"
            style={{
              background: '#1717d4',
              borderRadius: 24,
              padding: '70px 50px',
              color: '#fff',
            }}
          >

            {/* Decorative circles */}
            <div
              style={{
                position: 'absolute',
                width: 350,
                height: 350,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,.12)',
                right: -100,
                top: -160,
              }}
            />

            <div
              style={{
                position: 'absolute',
                width: 250,
                height: 250,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,.08)',
                right: 80,
                bottom: -180,
              }}
            />


            <div
              className="position-relative"
              style={{
                maxWidth: 720,
              }}
            >

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1.4,
                  textTransform: 'uppercase',
                  opacity: 0.7,
                }}
              >
                Start today
              </div>

              <h2
                className="mt-3 mb-3"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3.3rem)',
                  letterSpacing: '-1.5px',
                  fontWeight: 700,
                }}
              >
                Build connections that create opportunities.
              </h2>

              <p
                style={{
                  maxWidth: 600,
                  opacity: 0.8,
                  lineHeight: 1.7,
                }}
              >
                Create your profile and become part of a connected
                academic and company ecosystem.
              </p>

              <Link
                to="/register"
                className="btn btn-light px-4 py-3 fw-semibold mt-2"
                style={{
                  borderRadius: 10,
                }}
              >
                Get Started
                <i className="bi bi-arrow-right ms-2"></i>
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer
        style={{
          background: '#fff',
          borderTop: '1px solid #e8e9ef',
        }}
      >

        <div
          className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
          style={{
            padding: '28px 0',
          }}
        >

          <div
            className="d-flex align-items-center gap-2 fw-bold"
            style={{
              color: '#171a31',
            }}
          >

            <i
              className="bi bi-diagram-3-fill"
              style={{
                color: '#3737e8',
              }}
            />

            Academia–Company

          </div>

          <div
            style={{
              color: '#969aaa',
              fontSize: 12,
            }}
          >
            © {new Date().getFullYear()} Academia–Company Collaboration Platform
          </div>

        </div>

      </footer>

    </div>
  )
}


/* =========================================================
   DASHBOARD METRIC
========================================================= */

function DashboardMetric({ label, value, width }) {
  return (
    <div className="mb-3">

      <div
        className="d-flex justify-content-between mb-2"
        style={{
          fontSize: 12,
        }}
      >

        <span
          style={{
            color: '#73778c',
          }}
        >
          {label}
        </span>

        <span
          style={{
            color: '#20233b',
            fontWeight: 700,
          }}
        >
          {value}
        </span>

      </div>


      <div
        style={{
          height: 5,
          background: '#e9eaf0',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >

        <div
          style={{
            height: '100%',
            width,
            background: '#3c3ced',
            borderRadius: 10,
          }}
        />

      </div>

    </div>
  )
}


/* =========================================================
   STATS ITEM
========================================================= */

function Stat({ number, title, text }) {
  return (
    <div className="col-md-3">

      <div
        style={{
          minHeight: 130,
          padding: '30px 25px',
          borderRight: '1px solid rgba(255,255,255,.08)',
        }}
      >

        <div
          style={{
            fontSize: 11,
            color: '#7378a0',
            fontWeight: 700,
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          {number}
        </div>

        <div
          style={{
            fontSize: 17,
            fontWeight: 700,
            marginBottom: 5,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 12,
            color: '#858aa8',
            lineHeight: 1.5,
          }}
        >
          {text}
        </div>

      </div>

    </div>
  )
}