import { useState } from "react";

import {
  Leaf,
  Droplets,
  Sprout,
  TreePine,
  CloudRain,
  FlaskConical,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  BookOpen,
  MessageCircle,
  Send,
} from "lucide-react";

import "./App.css";


function App() {

  // =========================================================
  // ENVIRONMENTAL INPUTS
  // =========================================================

  const [form, setForm] = useState({

    region: "semi-arid",

    rainfall_mm: 500,

    land_use: "monoculture wheat",

    ph: 6.5,

    organic_carbon_pct: 0.3,

    moisture_pct: 15,

    species_richness: 5,

    habitat_diversity: 1,

    pollution: "low",

    deforestation: "moderate",

  });


  // =========================================================
  // ANALYSIS STATE
  // =========================================================

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // =========================================================
  // FOLLOW-UP CHAT STATE
  // =========================================================

  const [chatMessage, setChatMessage] =
    useState("");

  const [chatMessages, setChatMessages] =
    useState([]);

  const [chatLoading, setChatLoading] =
    useState(false);

  const [chatError, setChatError] =
    useState("");


  // =========================================================
  // UPDATE INPUT
  // =========================================================

  const updateField = (
    field,
    value
  ) => {

    setForm((previous) => ({

      ...previous,

      [field]: value,

    }));

  };


  // =========================================================
  // ANALYZE ENVIRONMENT
  // =========================================================

  const analyzeEnvironment =
    async () => {

      setLoading(true);

      setError("");

      setResult(null);

      // Clear previous conversation
      setChatMessages([]);

      setChatError("");


      // =====================================================
      // REQUEST PAYLOAD
      // =====================================================

      const payload = {

        text:
          "Biodiversity is declining on my farmland. " +
          "Please analyze the environmental conditions " +
          "and provide exactly three evidence-grounded " +
          "recommendations.",


        region:
          String(form.region),


        rainfall_mm:
          Number(form.rainfall_mm),


        land_use:
          String(form.land_use),


        soil: {

          ph:
            Number(form.ph),

          organic_carbon_pct:
            Number(
              form.organic_carbon_pct
            ),

          moisture_pct:
            Number(
              form.moisture_pct
            ),

        },


        biodiversity: {

          species_richness:
            String(
              form.species_richness
            ),

          habitat_diversity:
            String(
              form.habitat_diversity
            ),

        },


        human_impact: {

          pollution:
            String(form.pollution),

          deforestation:
            String(
              form.deforestation
            ),

        },

      };


      console.log(
        "Environmental request:",
        payload
      );


      // =====================================================
      // CALL FASTAPI
      // =====================================================

      try {

        const response =
          await fetch(
            "http://127.0.0.1:8000/api/analyze",
            {

              method: "POST",

              headers: {

                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",

              },

              body:
                JSON.stringify(
                  payload
                ),

            }
          );


        const responseText =
          await response.text();


        console.log(
          "FastAPI status:",
          response.status
        );


        console.log(
          "FastAPI response:",
          responseText
        );


        // =================================================
        // BACKEND ERROR
        // =================================================

        if (!response.ok) {

          throw new Error(
            `Backend returned HTTP ${response.status}: ${responseText}`
          );

        }


        // =================================================
        // PARSE RESPONSE
        // =================================================

        const data =
          JSON.parse(
            responseText
          );


        console.log(
          "Analysis result:",
          data
        );


        setResult(data);

        setError("");


      } catch (err) {

        console.error(
          "Environmental analysis error:",
          err
        );


        setError(
          err.message ||
          "Unable to connect to the FastAPI backend."
        );


      } finally {

        setLoading(false);

      }

    };


  // =========================================================
  // ASK FOLLOW-UP QUESTION
  // =========================================================

  const askFollowUp =
    async () => {

      // Don't send empty question
      if (
        !chatMessage.trim()
      ) {

        return;

      }


      const currentMessage =
        chatMessage.trim();


      // =====================================================
      // ADD USER MESSAGE
      // =====================================================

      setChatMessages(
        (previous) => [

          ...previous,

          {

            role: "user",

            content:
              currentMessage,

          },

        ]
      );


      setChatMessage("");

      setChatLoading(true);

      setChatError("");


      // =====================================================
      // SEND PREVIOUS ENVIRONMENTAL CONTEXT
      // =====================================================

      const payload = {

        message:
          currentMessage,


        // Previous environmental data

        region:
          form.region,


        rainfall_mm:
          Number(
            form.rainfall_mm
          ),


        land_use:
          form.land_use,


        ph:
          Number(
            form.ph
          ),


        organic_carbon_pct:
          Number(
            form.organic_carbon_pct
          ),


        moisture_pct:
          Number(
            form.moisture_pct
          ),


        species_richness:
          Number(
            form.species_richness
          ),


        habitat_diversity:
          Number(
            form.habitat_diversity
          ),


        pollution:
          form.pollution,


        deforestation:
          form.deforestation,


        // Previous recommendations

        recommendations:
          result?.recommendations ||
          [],

      };


      console.log(
        "Follow-up request:",
        payload
      );


      try {

        const response =
          await fetch(
            "http://127.0.0.1:8000/api/chat",
            {

              method: "POST",

              headers: {

                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",

              },

              body:
                JSON.stringify(
                  payload
                ),

            }
          );


        const responseText =
          await response.text();


        console.log(
          "Follow-up status:",
          response.status
        );


        console.log(
          "Follow-up response:",
          responseText
        );


        if (!response.ok) {

          throw new Error(
            `Backend returned HTTP ${response.status}: ${responseText}`
          );

        }


        const data =
          JSON.parse(
            responseText
          );


        // =================================================
        // ADD AI RESPONSE
        // =================================================

        setChatMessages(
          (previous) => [

            ...previous,

            {

              role: "ai",

              content:
                data.answer ||
                "I could not generate a follow-up answer.",

            },

          ]
        );


      } catch (err) {

        console.error(
          "Follow-up error:",
          err
        );


        setChatError(
          err.message ||
          "Unable to connect to the AI."
        );


      } finally {

        setChatLoading(false);

      }

    };


  // =========================================================
  // HANDLE ENTER KEY
  // =========================================================

  const handleChatKeyDown =
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !chatLoading
      ) {

        event.preventDefault();

        askFollowUp();

      }

    };


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="app">


      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="hero">

        <div className="brand">

          <div className="logo">

            <Leaf size={30} />

          </div>


          <div>

            <h1>
              Biodiversity Intelligence AI
            </h1>

            <p>
              AI-powered environmental analysis
              and biodiversity guidance
            </p>

          </div>

        </div>


        <div className="status">

          <span></span>

          AI System Ready

        </div>

      </header>


      {/* =====================================================
          MAIN
          ===================================================== */}

      <main>


        {/* ===================================================
            INTRODUCTION
            =================================================== */}

        <section className="intro">

          <h2>
            Environmental Assessment
          </h2>

          <p>
            Provide environmental conditions
            to analyze relationships between
            soil, climate, land use and
            biodiversity.
          </p>

        </section>


        {/* ===================================================
            INPUT GRID
            =================================================== */}

        <section className="input-grid">


          {/* REGION */}

          <div className="input-card">

            <CloudRain />

            <label>
              Region
            </label>

            <input
              type="text"
              value={form.region}
              onChange={(event) =>
                updateField(
                  "region",
                  event.target.value
                )
              }
            />

          </div>


          {/* LAND USE */}

          <div className="input-card">

            <Sprout />

            <label>
              Land Use
            </label>

            <input
              type="text"
              value={form.land_use}
              onChange={(event) =>
                updateField(
                  "land_use",
                  event.target.value
                )
              }
            />

          </div>


          {/* RAINFALL */}

          <div className="input-card">

            <Droplets />

            <label>
              Annual Rainfall (mm)
            </label>

            <input
              type="number"
              value={
                form.rainfall_mm
              }
              onChange={(event) =>
                updateField(
                  "rainfall_mm",
                  event.target.value
                )
              }
            />

          </div>


          {/* SOIL PH */}

          <div className="input-card">

            <FlaskConical />

            <label>
              Soil pH
            </label>

            <input
              type="number"
              step="0.1"
              value={form.ph}
              onChange={(event) =>
                updateField(
                  "ph",
                  event.target.value
                )
              }
            />

          </div>


          {/* ORGANIC CARBON */}

          <div className="input-card">

            <Leaf />

            <label>
              Organic Carbon (%)
            </label>

            <input
              type="number"
              step="0.1"
              value={
                form.organic_carbon_pct
              }
              onChange={(event) =>
                updateField(
                  "organic_carbon_pct",
                  event.target.value
                )
              }
            />

          </div>


          {/* SOIL MOISTURE */}

          <div className="input-card">

            <Droplets />

            <label>
              Soil Moisture (%)
            </label>

            <input
              type="number"
              value={
                form.moisture_pct
              }
              onChange={(event) =>
                updateField(
                  "moisture_pct",
                  event.target.value
                )
              }
            />

          </div>


          {/* SPECIES RICHNESS */}

          <div className="input-card">

            <TreePine />

            <label>
              Species Richness
            </label>

            <input
              type="number"
              value={
                form.species_richness
              }
              onChange={(event) =>
                updateField(
                  "species_richness",
                  event.target.value
                )
              }
            />

          </div>


          {/* HABITAT DIVERSITY */}

          <div className="input-card">

            <TreePine />

            <label>
              Habitat Diversity
            </label>

            <input
              type="number"
              value={
                form.habitat_diversity
              }
              onChange={(event) =>
                updateField(
                  "habitat_diversity",
                  event.target.value
                )
              }
            />

          </div>


          {/* POLLUTION */}

          <div className="input-card">

            <label>
              Pollution
            </label>

            <select
              value={
                form.pollution
              }
              onChange={(event) =>
                updateField(
                  "pollution",
                  event.target.value
                )
              }
            >

              <option value="low">
                Low
              </option>

              <option value="moderate">
                Moderate
              </option>

              <option value="high">
                High
              </option>

            </select>

          </div>


          {/* DEFORESTATION */}

          <div className="input-card">

            <label>
              Deforestation
            </label>

            <select
              value={
                form.deforestation
              }
              onChange={(event) =>
                updateField(
                  "deforestation",
                  event.target.value
                )
              }
            >

              <option value="low">
                Low
              </option>

              <option value="moderate">
                Moderate
              </option>

              <option value="high">
                High
              </option>

            </select>

          </div>


        </section>


        {/* ===================================================
            ANALYZE BUTTON
            =================================================== */}

        <button
          className="analyze-button"
          onClick={
            analyzeEnvironment
          }
          disabled={loading}
        >

          <Search size={20} />

          {loading
            ? "Analyzing Environment..."
            : "Analyze Environment"}

        </button>


        {/* ===================================================
            ANALYSIS ERROR
            =================================================== */}

        {error && (

          <div className="error-box">

            <AlertTriangle />

            <div>

              <strong>
                Analysis Error
              </strong>

              <div>
                {error}
              </div>

            </div>

          </div>

        )}


        {/* ===================================================
            RESULTS
            =================================================== */}

        {result && (

          <section className="results">


            {/* =================================================
                DIAGNOSIS
                ================================================= */}

            <div className="section-title">

              <CheckCircle2 />

              <div>

                <h2>
                  AI Environmental Diagnosis
                </h2>

                <p>
                  Multi-metric environmental
                  reasoning
                </p>

              </div>

            </div>


            <div className="diagnosis-card">

              <h3>
                Environmental Diagnosis
              </h3>

              <p
                style={{
                  whiteSpace:
                    "pre-line",
                }}
              >

                {result.diagnosis ||
                  "Environmental conditions have been analyzed using multiple environmental indicators."}

              </p>

            </div>


            {/* =================================================
                RECOMMENDATIONS
                ================================================= */}

            <h2 className="result-heading">

              🌱 Recommended Actions

            </h2>


            <div className="recommendations">


              {result.recommendations &&
              result.recommendations.length >
                0 ? (

                result.recommendations
                  .slice(0, 3)
                  .map(
                    (
                      recommendation,
                      index
                    ) => (

                      <div
                        className="recommendation-card"
                        key={index}
                      >


                        <div className="recommendation-icon">

                          {index === 0 && (
                            <Leaf />
                          )}

                          {index === 1 && (
                            <TreePine />
                          )}

                          {index === 2 && (
                            <Sprout />
                          )}

                        </div>


                        <div>

                          <h3>

                            {recommendation.action ||
                              recommendation.title ||
                              `Recommendation ${
                                index + 1
                              }`}

                          </h3>


                          <p>

                            {recommendation.why_it_works ||
                              recommendation.why ||
                              recommendation.reason ||
                              "Evidence-grounded environmental intervention."}

                          </p>


                          {/* METRICS */}

                          {recommendation.impacted_metrics &&
                            recommendation
                              .impacted_metrics
                              .length >
                              0 && (

                              <div className="metrics">

                                {recommendation
                                  .impacted_metrics
                                  .map(
                                    (
                                      metric,
                                      metricIndex
                                    ) => (

                                      <span
                                        key={
                                          metricIndex
                                        }
                                      >

                                        {metric}

                                      </span>

                                    )
                                  )}

                              </div>

                            )}


                          {/* TIME */}

                          {recommendation.time_horizon && (

                            <div className="time">

                              <Clock3
                                size={16}
                              />

                              {
                                recommendation.time_horizon
                              }

                            </div>

                          )}


                          {/* CONFIDENCE */}

                          {recommendation.confidence && (

                            <div className="time">

                              Confidence:{" "}

                              {
                                recommendation.confidence
                              }

                            </div>

                          )}

                        </div>

                      </div>

                    )
                  )

              ) : (

                <div className="diagnosis-card">

                  <p>
                    The system did not return
                    recommendations.
                  </p>

                </div>

              )}

            </div>


            {/* =================================================
                FOLLOW-UP AI CHAT
                ================================================= */}

            <div
              className="follow-up-chat"
              style={{
                marginTop: "30px",
                padding: "28px",
                background: "#ffffff",
                borderRadius: "18px",
                border:
                  "1px solid #d8e9df",
                boxShadow:
                  "0 8px 30px rgba(25, 80, 50, 0.06)",
              }}
            >


              {/* CHAT HEADER */}

              <div className="section-title">

                <MessageCircle />

                <div>

                  <h2>
                    Ask Biodiversity Intelligence AI
                  </h2>

                  <p>
                    Ask a follow-up about this
                    environmental analysis
                  </p>

                </div>

              </div>


              {/* =================================================
                  CHAT MESSAGES
                  ================================================= */}

              {chatMessages.length >
                0 && (

                <div
                  style={{
                    marginTop:
                      "20px",

                    display:
                      "flex",

                    flexDirection:
                      "column",

                    gap:
                      "14px",
                  }}
                >

                  {chatMessages.map(
                    (
                      message,
                      index
                    ) => (

                      <div
                        key={index}
                        style={{
                          display:
                            "flex",

                          justifyContent:
                            message.role ===
                            "user"
                              ? "flex-end"
                              : "flex-start",
                        }}
                      >

                        <div
                          style={{
                            maxWidth:
                              "80%",

                            padding:
                              "16px 20px",

                            borderRadius:
                              "16px",

                            background:
                              message.role ===
                              "user"
                                ? "#dff4e7"
                                : "#f1f7f3",

                            color:
                              "#173b2b",

                            lineHeight:
                              "1.6",

                            whiteSpace:
                              "pre-line",
                          }}
                        >

                          <strong>

                            {message.role ===
                            "user"
                              ? "You"
                              : "Biodiversity Intelligence AI"}

                          </strong>


                          <div
                            style={{
                              marginTop:
                                "6px",
                            }}
                          >

                            {
                              message.content
                            }

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}


              {/* =================================================
                  CHAT INPUT
                  ================================================= */}

              <div
                style={{
                  display:
                    "flex",

                  gap:
                    "12px",

                  marginTop:
                    "20px",
                }}
              >

                <input
                  type="text"
                  value={
                    chatMessage
                  }
                  onChange={(
                    event
                  ) =>
                    setChatMessage(
                      event.target
                        .value
                    )
                  }
                  onKeyDown={
                    handleChatKeyDown
                  }
                  placeholder="Ask a follow-up about your analysis..."
                  disabled={
                    chatLoading
                  }
                  style={{
                    flex:
                      1,

                    padding:
                      "16px",

                    borderRadius:
                      "12px",

                    border:
                      "1px solid #cbded2",

                    fontSize:
                      "16px",

                    outline:
                      "none",

                    color:
                      "#173b2b",

                    background:
                      "#ffffff",
                  }}
                />


                <button
                  onClick={
                    askFollowUp
                  }
                  disabled={
                    chatLoading ||
                    !chatMessage.trim()
                  }
                  style={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap:
                      "8px",

                    padding:
                      "0 24px",

                    borderRadius:
                      "12px",

                    border:
                      "none",

                    background:
                      "#207a4b",

                    color:
                      "white",

                    fontSize:
                      "16px",

                    fontWeight:
                      "600",

                    cursor:
                      chatLoading ||
                      !chatMessage.trim()
                        ? "not-allowed"
                        : "pointer",

                    opacity:
                      chatLoading ||
                      !chatMessage.trim()
                        ? 0.6
                        : 1,
                  }}
                >

                  <Send size={18} />

                  {chatLoading
                    ? "Thinking..."
                    : "Ask AI"}

                </button>

              </div>


              {/* =================================================
                  SUGGESTED QUESTIONS
                  ================================================= */}

              <div
                style={{
                  marginTop:
                    "16px",

                  display:
                    "flex",

                  flexWrap:
                    "wrap",

                  gap:
                    "8px",
                }}
              >

                {[
                  "Which recommendation should I start with?",

                  "What should I measure after 6 months?",

                  "How can I improve biodiversity?",

                  "Which action is suitable for low rainfall?",

                  "Why is soil carbon important?",
                ].map(
                  (
                    question,
                    index
                  ) => (

                    <button
                      key={index}
                      onClick={() =>
                        setChatMessage(
                          question
                        )
                      }
                      style={{
                        padding:
                          "9px 14px",

                        borderRadius:
                          "20px",

                        border:
                          "1px solid #b9d8c4",

                        background:
                          "#f5faf7",

                        color:
                          "#24633f",

                        cursor:
                          "pointer",

                        fontSize:
                          "13px",
                      }}
                    >

                      {question}

                    </button>

                  )
                )}

              </div>


              {/* =================================================
                  CHAT ERROR
                  ================================================= */}

              {chatError && (

                <div
                  style={{
                    marginTop:
                      "15px",

                    padding:
                      "12px 15px",

                    borderRadius:
                      "10px",

                    background:
                      "#fff0f0",

                    color:
                      "#b42318",
                  }}
                >

                  <AlertTriangle
                    size={16}
                    style={{
                      verticalAlign:
                        "middle",

                      marginRight:
                        "6px",
                    }}
                  />

                  {chatError}

                </div>

              )}

            </div>


            {/* =================================================
                SCIENTIFIC EVIDENCE
                ================================================= */}

            <div className="evidence">

              <div className="section-title">

                <BookOpen />

                <div>

                  <h2>
                    Scientific Evidence
                  </h2>

                  <p>
                    Retrieved environmental
                    knowledge
                  </p>

                </div>

              </div>


              <div className="evidence-content">

                {result.retrieved_evidence &&
                result.retrieved_evidence.length >
                  0 ? (

                  result.retrieved_evidence.map(
                    (
                      item,
                      index
                    ) => (

                      <div
                        key={index}
                        className="evidence-item"
                      >

                        {typeof item ===
                        "string"
                          ? item
                          : item.title ||
                            item.source ||
                            item.text ||
                            JSON.stringify(
                              item
                            )}

                      </div>

                    )
                  )

                ) : (

                  <div className="evidence-item">

                    Scientific evidence was
                    retrieved during the
                    environmental assessment.

                  </div>

                )}

              </div>

            </div>


            {/* =================================================
                ANALYSIS SUMMARY
                ================================================= */}

            {result.conversation_summary && (

              <div
                className="diagnosis-card"
                style={{
                  marginTop:
                    "20px",
                }}
              >

                <h3>
                  Analysis Summary
                </h3>

                <p
                  style={{
                    whiteSpace:
                      "pre-line",
                  }}
                >

                  {
                    result.conversation_summary
                  }

                </p>

              </div>

            )}

          </section>

        )}

      </main>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer>

        <Leaf size={18} />

        <span>

          Biodiversity Intelligence AI
          {" • "}
          Evidence-grounded environmental reasoning

        </span>

      </footer>

    </div>

  );
}


export default App;