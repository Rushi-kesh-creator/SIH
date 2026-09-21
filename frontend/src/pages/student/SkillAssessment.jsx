import { useEffect, useMemo, useState } from 'react'
import { getRecommendedOpportunities } from '../../api/studentApi'
import EmptyState from '../../components/EmptyState.jsx'
import Loading from '../../components/Loading.jsx'

const SKILL_GAP_CACHE_KEY = 'student_skill_assessment_gaps'

const QUESTION_BANK = {
  react: [
    {
      question:
        'Which React hook is used to manage state in a functional component?',
      options: ['useEffect', 'useState', 'useRef', 'useMemo'],
      answer: 'useState',
    },
    {
      question:
        'Which prop is used to pass data from a parent component to a child component?',
      options: ['state', 'props', 'context', 'ref'],
      answer: 'props',
    },
    {
      question:
        'Which method is commonly used to render a list of elements in React?',
      options: ['filter()', 'map()', 'reduce()', 'forEach()'],
      answer: 'map()',
    },
    {
      question: 'What is JSX in React?',
      options: [
        'A database',
        'A JavaScript syntax extension for describing UI',
        'A CSS framework',
        'A backend API',
      ],
      answer:
        'A JavaScript syntax extension for describing UI',
    },
    {
      question:
        'Which hook is commonly used for side effects such as API calls?',
      options: [
        'useState',
        'useEffect',
        'useContext',
        'useMemo',
      ],
      answer: 'useEffect',
    },
  ],

  python: [
    {
      question:
        'Which keyword is used to define a function in Python?',
      options: ['function', 'def', 'func', 'define'],
      answer: 'def',
    },
    {
      question:
        'Which data type stores key-value pairs in Python?',
      options: ['List', 'Tuple', 'Dictionary', 'Set'],
      answer: 'Dictionary',
    },
    {
      question:
        'Which symbol is used for comments in Python?',
      options: ['//', '#', '/*', '--'],
      answer: '#',
    },
    {
      question:
        'Which library is commonly used for numerical arrays in Python?',
      options: [
        'NumPy',
        'React',
        'Bootstrap',
        'Express',
      ],
      answer: 'NumPy',
    },
    {
      question:
        'Which keyword is used to handle exceptions?',
      options: ['catch', 'except', 'error', 'handle'],
      answer: 'except',
    },
  ],

  sql: [
    {
      question:
        'Which SQL command is used to retrieve data from a table?',
      options: ['GET', 'SELECT', 'FETCH', 'READ'],
      answer: 'SELECT',
    },
    {
      question:
        'Which clause is used to filter rows in SQL?',
      options: [
        'ORDER BY',
        'GROUP BY',
        'WHERE',
        'FILTER',
      ],
      answer: 'WHERE',
    },
    {
      question:
        'Which command is used to add a new row to a table?',
      options: [
        'ADD',
        'INSERT',
        'CREATE',
        'UPDATE',
      ],
      answer: 'INSERT',
    },
    {
      question:
        'Which SQL command modifies existing records?',
      options: [
        'CHANGE',
        'MODIFY',
        'UPDATE',
        'ALTER',
      ],
      answer: 'UPDATE',
    },
    {
      question:
        'Which keyword is used to remove duplicate results?',
      options: [
        'UNIQUE',
        'DISTINCT',
        'REMOVE',
        'DEDUP',
      ],
      answer: 'DISTINCT',
    },
  ],

  javascript: [
    {
      question:
        'Which keyword declares a block-scoped variable that can be reassigned?',
      options: ['var', 'let', 'const', 'define'],
      answer: 'let',
    },
    {
      question:
        'Which method converts JSON text into a JavaScript object?',
      options: [
        'JSON.parse()',
        'JSON.stringify()',
        'JSON.convert()',
        'JSON.object()',
      ],
      answer: 'JSON.parse()',
    },
    {
      question:
        'Which operator checks both value and type equality?',
      options: ['=', '==', '===', '!='],
      answer: '===',
    },
    {
      question:
        'Which array method creates a new array by transforming each element?',
      options: [
        'map()',
        'push()',
        'pop()',
        'shift()',
      ],
      answer: 'map()',
    },
    {
      question:
        'Which keyword is used to declare a constant?',
      options: [
        'let',
        'var',
        'const',
        'static',
      ],
      answer: 'const',
    },
  ],

  flask: [
    {
      question:
        'Flask is primarily a framework for which language?',
      options: [
        'Java',
        'Python',
        'JavaScript',
        'C++',
      ],
      answer: 'Python',
    },
    {
      question:
        'Which decorator is commonly used to define a Flask route?',
      options: [
        '@route',
        '@app.route',
        '@path',
        '@endpoint',
      ],
      answer: '@app.route',
    },
    {
      question:
        'Which object is commonly used to create a Flask application?',
      options: [
        'Flask()',
        'App()',
        'Server()',
        'WebApp()',
      ],
      answer: 'Flask()',
    },
    {
      question:
        'Which HTTP method is commonly used to submit data to a Flask endpoint?',
      options: [
        'GET',
        'POST',
        'READ',
        'FETCH',
      ],
      answer: 'POST',
    },
    {
      question:
        'Which file commonly contains Python Flask application code?',
      options: [
        'app.py',
        'index.html',
        'style.css',
        'package.json',
      ],
      answer: 'app.py',
    },
  ],

  fastapi: [
    {
      question:
        'FastAPI is a web framework primarily used with which language?',
      options: [
        'Python',
        'Java',
        'C#',
        'Ruby',
      ],
      answer: 'Python',
    },
    {
      question:
        'Which decorator commonly defines a GET endpoint in FastAPI?',
      options: [
        '@app.get',
        '@app.fetch',
        '@get.route',
        '@api.get',
      ],
      answer: '@app.get',
    },
    {
      question:
        'Which library is heavily used by FastAPI for data validation?',
      options: [
        'Pydantic',
        'Pandas',
        'NumPy',
        'Matplotlib',
      ],
      answer: 'Pydantic',
    },
    {
      question:
        'Which HTTP method is normally used to create a resource?',
      options: [
        'GET',
        'POST',
        'DELETE',
        'HEAD',
      ],
      answer: 'POST',
    },
    {
      question:
        'FastAPI automatically provides interactive API documentation through which common route?',
      options: [
        '/docs',
        '/database',
        '/admin',
        '/home',
      ],
      answer: '/docs',
    },
  ],

  postgresql: [
    {
      question:
        'PostgreSQL is a type of what?',
      options: [
        'Programming language',
        'Relational database',
        'Frontend framework',
        'Operating system',
      ],
      answer: 'Relational database',
    },
    {
      question:
        'Which SQL command retrieves records from PostgreSQL?',
      options: [
        'SELECT',
        'GET',
        'READ',
        'FETCHALL',
      ],
      answer: 'SELECT',
    },
    {
      question:
        'Which constraint uniquely identifies a row?',
      options: [
        'FOREIGN KEY',
        'PRIMARY KEY',
        'CHECK',
        'DEFAULT',
      ],
      answer: 'PRIMARY KEY',
    },
    {
      question:
        'Which command creates a new PostgreSQL table?',
      options: [
        'CREATE TABLE',
        'NEW TABLE',
        'ADD TABLE',
        'MAKE TABLE',
      ],
      answer: 'CREATE TABLE',
    },
    {
      question:
        'Which PostgreSQL data type is commonly used for variable-length text?',
      options: [
        'VARCHAR',
        'BOOLEAN',
        'INTEGER',
        'DATE',
      ],
      answer: 'VARCHAR',
    },
  ],

  git: [
    {
      question:
        'Which command initializes a Git repository?',
      options: [
        'git start',
        'git init',
        'git create',
        'git repo',
      ],
      answer: 'git init',
    },
    {
      question:
        'Which command downloads a remote repository?',
      options: [
        'git download',
        'git clone',
        'git pullrepo',
        'git copy',
      ],
      answer: 'git clone',
    },
    {
      question:
        'Which command uploads local commits to a remote repository?',
      options: [
        'git push',
        'git upload',
        'git send',
        'git commit',
      ],
      answer: 'git push',
    },
    {
      question:
        'Which command records changes in the Git history?',
      options: [
        'git save',
        'git commit',
        'git record',
        'git store',
      ],
      answer: 'git commit',
    },
    {
      question:
        'Which command shows the current Git status?',
      options: [
        'git state',
        'git status',
        'git check',
        'git info',
      ],
      answer: 'git status',
    },
  ],

  'machine learning': [
    {
      question:
        'Which type of learning uses labeled training data?',
      options: [
        'Supervised learning',
        'Unsupervised learning',
        'Reinforcement learning',
        'Random learning',
      ],
      answer: 'Supervised learning',
    },
    {
      question:
        'Which algorithm is commonly used for classification?',
      options: [
        'Random Forest',
        'Linear Search',
        'Binary Search',
        'Merge Sort',
      ],
      answer: 'Random Forest',
    },
    {
      question:
        'What is overfitting?',
      options: [
        'Model performs well on training data but poorly on unseen data',
        'Model has no training data',
        'Model always predicts one class',
        'Model has too few features',
      ],
      answer:
        'Model performs well on training data but poorly on unseen data',
    },
    {
      question:
        'Which metric is commonly used for classification performance?',
      options: [
        'Accuracy',
        'File size',
        'CPU frequency',
        'Memory address',
      ],
      answer: 'Accuracy',
    },
    {
      question:
        'What is a feature in machine learning?',
      options: [
        'An input variable used by the model',
        'The final prediction only',
        'The model filename',
        'A database password',
      ],
      answer:
        'An input variable used by the model',
    },
  ],
}

function normalizeSkill(skill) {
  return String(skill || '')
    .trim()
    .toLowerCase()
}

function getQuestionsForSkill(skill) {
  const normalized = normalizeSkill(skill)

  if (QUESTION_BANK[normalized]) {
    return QUESTION_BANK[normalized]
  }

  const aliases = {
    'scikit-learn': 'machine learning',
    sklearn: 'machine learning',
    pandas: 'python',
    numpy: 'python',
    reactjs: 'react',
    'react.js': 'react',
    'node.js': 'javascript',
    nodejs: 'javascript',
  }

  const mappedSkill = aliases[normalized]

  return mappedSkill
    ? QUESTION_BANK[mappedSkill]
    : []
}

export default function StudentSkillAssessment() {
  const [opportunities, setOpportunities] = useState(() => {
    try {
      const cached = sessionStorage.getItem(
        SKILL_GAP_CACHE_KEY
      )

      return cached
        ? JSON.parse(cached)
        : []
    } catch {
      return []
    }
  })

  const [status, setStatus] = useState(() => {
    try {
      return sessionStorage.getItem(
        SKILL_GAP_CACHE_KEY
      )
        ? 'ready'
        : 'loading'
    } catch {
      return 'loading'
    }
  })

  const [error, setError] = useState('')

  const [selectedSkill, setSelectedSkill] =
    useState(null)

  const [currentQuestion, setCurrentQuestion] =
    useState(0)

  const [answers, setAnswers] = useState({})

  const [result, setResult] = useState(null)

  /* =========================================================
     LOAD AI SKILL GAPS
     ========================================================= */

  useEffect(() => {
    /*
     * Cached AI opportunity data exists.
     * Don't make another API request.
     */
    if (opportunities.length > 0) {
      return
    }

    let cancelled = false

    const loadOpportunities = async () => {
      try {
        setStatus('loading')
        setError('')

        const { data } =
          await getRecommendedOpportunities()

        if (cancelled) return

        const nextOpportunities =
          Array.isArray(data?.opportunities)
            ? data.opportunities
            : []

        setOpportunities(nextOpportunities)

        sessionStorage.setItem(
          SKILL_GAP_CACHE_KEY,
          JSON.stringify(nextOpportunities)
        )

        setStatus('ready')
      } catch (requestError) {
        if (cancelled) return

        setStatus('error')

        setError(
          requestError.response?.data?.detail ||
            'Unable to load your AI skill gaps.'
        )
      }
    }

    loadOpportunities()

    return () => {
      cancelled = true
    }
  }, [opportunities.length])

  /* =========================================================
     BUILD SKILL GAP LIST
     ========================================================= */

  const skillGaps = useMemo(() => {
    const gapMap = new Map()

    opportunities.forEach((opportunity) => {
      const missingSkills =
        Array.isArray(
          opportunity.missing_skills
        )
          ? opportunity.missing_skills
          : []

      missingSkills.forEach((skill) => {
        const normalized =
          normalizeSkill(skill)

        if (!normalized) return

        if (!gapMap.has(normalized)) {
          gapMap.set(normalized, {
            skill: normalized,
            opportunities: [],
          })
        }

        gapMap
          .get(normalized)
          .opportunities.push(
            opportunity.title
          )
      })
    })

    return Array.from(gapMap.values())
  }, [opportunities])

  /* =========================================================
     START ASSESSMENT
     ========================================================= */

  const startAssessment = (skill) => {
    setSelectedSkill(skill)
    setCurrentQuestion(0)
    setAnswers({})
    setResult(null)
  }

  /* =========================================================
     ANSWER
     ========================================================= */

  const handleAnswer = (answer) => {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion]: answer,
    }))
  }

  /* =========================================================
     NEXT / SUBMIT
     ========================================================= */

  const handleNext = () => {
    const questions =
      getQuestionsForSkill(selectedSkill)

    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        (previous) => previous + 1
      )

      return
    }

    const correctAnswers =
      questions.reduce(
        (score, question, index) =>
          score +
          (answers[index] === question.answer
            ? 1
            : 0),
        0
      )

    const percentage = Math.round(
      (correctAnswers /
        questions.length) *
        100
    )

    setResult({
      correct: correctAnswers,
      total: questions.length,
      percentage,
      passed: percentage >= 60,
    })
  }

  /* =========================================================
     RESTART
     ========================================================= */

  const restartAssessment = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setResult(null)
  }

  /* =========================================================
     LOADING
     ========================================================= */

  if (status === 'loading') {
    return (
      <Loading
        label="Analyzing your current skill gaps…"
        fullPage
      />
    )
  }

  /* =========================================================
     ERROR
     ========================================================= */

  if (status === 'error') {
    return (
      <div className="aic-card p-4">
        <EmptyState
          variant="error"
          description={error}
        />
      </div>
    )
  }

  /* =========================================================
     ASSESSMENT NOT AVAILABLE
     ========================================================= */

  if (selectedSkill) {
    const questions =
      getQuestionsForSkill(selectedSkill)

    if (questions.length === 0) {
      return (
        <div>
          <button
            type="button"
            className="btn btn-outline-secondary mb-4"
            onClick={() =>
              setSelectedSkill(null)
            }
          >
            <i className="bi bi-arrow-left me-2" />
            Back to skill gaps
          </button>

          <div className="aic-card p-4">
            <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis mb-3">
              Coming Soon
            </span>

            <h1 className="h4 font-display mb-2">
              {selectedSkill} Assessment
            </h1>

            <p className="text-secondary mb-0">
              An assessment for this skill is not
              available yet.
            </p>
          </div>
        </div>
      )
    }

    /* =======================================================
       RESULT
       ======================================================= */

    if (result) {
      return (
        <div>
          <button
            type="button"
            className="btn btn-outline-secondary mb-4"
            onClick={() =>
              setSelectedSkill(null)
            }
          >
            <i className="bi bi-arrow-left me-2" />
            Back to skill gaps
          </button>

          <div
            className="aic-card p-4 p-md-5 text-center"
            style={{ maxWidth: 720 }}
          >
            <div
              className={`d-inline-flex align-items-center justify-content-center rounded-circle mb-4 ${
                result.passed
                  ? 'bg-success-subtle text-success'
                  : 'bg-warning-subtle text-warning-emphasis'
              }`}
              style={{
                width: 76,
                height: 76,
                fontSize: 30,
              }}
            >
              <i
                className={`bi ${
                  result.passed
                    ? 'bi-check-lg'
                    : 'bi-book'
                }`}
              />
            </div>

            <div className="small text-secondary fw-semibold mb-2">
              ASSESSMENT COMPLETE
            </div>

            <h1 className="h3 font-display fw-bold mb-2">
              {selectedSkill}
            </h1>

            <p className="text-secondary mb-4">
              You answered {result.correct} of{' '}
              {result.total} questions correctly.
            </p>

            <div className="display-4 fw-bold mb-2">
              {result.percentage}%
            </div>

            <div
              className={`fw-semibold mb-3 ${
                result.passed
                  ? 'text-success'
                  : 'text-warning-emphasis'
              }`}
            >
              {result.passed
                ? 'Assessment Passed'
                : 'Needs Improvement'}
            </div>

            <p className="text-secondary small mb-4">
              {result.passed
                ? `You demonstrated a good understanding of ${selectedSkill}.`
                : `Consider learning ${selectedSkill} and taking the assessment again.`}
            </p>

            <button
              type="button"
              className="btn btn-aic-primary"
              onClick={restartAssessment}
            >
              <i className="bi bi-arrow-repeat me-2" />
              Retake Assessment
            </button>
          </div>
        </div>
      )
    }

    /* =======================================================
       QUESTION
       ======================================================= */

    const question =
      questions[currentQuestion]

    const selectedAnswer =
      answers[currentQuestion]

    const progress =
      ((currentQuestion + 1) /
        questions.length) *
      100

    return (
      <div>

        <button
          type="button"
          className="btn btn-outline-secondary mb-4"
          onClick={() =>
            setSelectedSkill(null)
          }
        >
          <i className="bi bi-arrow-left me-2" />
          Back to skill gaps
        </button>

        <div className="mb-4">
          <div className="small text-secondary fw-semibold mb-1">
            SKILL ASSESSMENT
          </div>

          <h1 className="h3 font-display fw-bold mb-1">
            {selectedSkill}
          </h1>

          <p className="text-secondary mb-0">
            Test your knowledge and measure your
            current understanding.
          </p>
        </div>

        <div
          className="aic-card p-4 p-md-5"
          style={{ maxWidth: 850 }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small text-secondary">
              Question {currentQuestion + 1} of{' '}
              {questions.length}
            </span>

            <span className="small fw-semibold">
              {Math.round(progress)}%
            </span>
          </div>

          <div
            className="progress mb-5"
            style={{ height: 7 }}
          >
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <h2 className="h5 fw-bold mb-4">
            {question.question}
          </h2>

          <div className="d-flex flex-column gap-3">
            {question.options.map(
              (option, index) => {
                const isSelected =
                  selectedAnswer === option

                return (
                  <button
                    key={option}
                    type="button"
                    className={`btn text-start p-3 border rounded-3 ${
                      isSelected
                        ? 'btn-aic-primary'
                        : 'btn-outline-secondary'
                    }`}
                    onClick={() =>
                      handleAnswer(option)
                    }
                  >
                    <span className="fw-semibold me-2">
                      {String.fromCharCode(
                        65 + index
                      )}.
                    </span>

                    {option}
                  </button>
                )
              }
            )}
          </div>

          <div className="d-flex justify-content-between align-items-center mt-5">

            <span className="text-secondary small">
              Select one answer to continue.
            </span>

            <button
              type="button"
              className="btn btn-aic-primary"
              disabled={!selectedAnswer}
              onClick={handleNext}
            >
              {currentQuestion ===
              questions.length - 1
                ? 'Submit Assessment'
                : 'Next Question'}

              <i
                className={`bi ${
                  currentQuestion ===
                  questions.length - 1
                    ? 'bi-check-lg'
                    : 'bi-arrow-right'
                } ms-2`}
              />
            </button>

          </div>
        </div>
      </div>
    )
  }

  /* =========================================================
     MAIN SKILL GAP PAGE
     ========================================================= */

  return (
    <div>

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <div className="small text-secondary fw-semibold mb-1">
            AI-POWERED LEARNING
          </div>

          <h1 className="h3 font-display fw-bold mb-1">
            Skill Assessment
          </h1>

          <p className="text-secondary mb-0">
            Test the skills identified as gaps in your
            profile.
          </p>
        </div>

        <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2">
          {skillGaps.length} skill{' '}
          {skillGaps.length === 1
            ? 'gap'
            : 'gaps'}
        </span>
      </div>

      {/* Explanation */}
      <div className="aic-card p-4 mb-4">

        <div className="d-flex align-items-start gap-3">

          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary flex-shrink-0"
            style={{
              width: 42,
              height: 42,
            }}
          >
            <i className="bi bi-stars" />
          </div>

          <div>
            <h2 className="h6 fw-bold mb-1">
              AI-Identified Skill Gaps
            </h2>

            <p className="text-secondary small mb-0">
              These skills are required by active
              opportunities but were not sufficiently
              identified in your resume.
            </p>
          </div>

        </div>

      </div>

      {/* No gaps */}
      {skillGaps.length === 0 ? (
        <div className="aic-card p-4">
          <EmptyState
            description="No skill gaps were identified from your current resume and active opportunities."
          />
        </div>
      ) : (
        <div className="row g-3">

          {skillGaps.map((gap) => {
            const available =
              getQuestionsForSkill(
                gap.skill
              ).length > 0

            return (
              <div
                className="col-12 col-md-6 col-xl-4"
                key={gap.skill}
              >
                <div className="aic-card p-4 h-100 d-flex flex-column">

                  <div className="d-flex justify-content-between align-items-start mb-3">

                    <span className="badge rounded-pill bg-danger-subtle text-danger-emphasis">
                      Skill Gap
                    </span>

                    <i className="bi bi-arrow-up-right text-secondary" />

                  </div>

                  <h2 className="h5 fw-bold text-capitalize mb-2">
                    {gap.skill}
                  </h2>

                  <p className="text-secondary small mb-4">
                    Required by{' '}
                    <strong>
                      {gap.opportunities.length}
                    </strong>{' '}
                    {gap.opportunities.length === 1
                      ? 'opportunity'
                      : 'opportunities'}.
                  </p>

                  <div className="mt-auto">

                    <button
                      type="button"
                      className="btn btn-aic-primary w-100"
                      disabled={!available}
                      onClick={() =>
                        startAssessment(
                          gap.skill
                        )
                      }
                    >
                      <i
                        className={`bi ${
                          available
                            ? 'bi-play-circle'
                            : 'bi-clock'
                        } me-2`}
                      />

                      {available
                        ? 'Take Assessment'
                        : 'Assessment Coming Soon'}
                    </button>

                  </div>

                </div>
              </div>
            )
          })}

        </div>
      )}
    </div>
  )
}