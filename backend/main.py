from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from backend.ai.reasoning import analyze


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="Biodiversity Intelligence AI",
    description="AI-powered biodiversity and environmental reasoning system",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "service": "Biodiversity Intelligence AI",
        "status": "running",
        "message": "Environmental intelligence API is running.",
    }


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "Biodiversity Intelligence AI",
    }


# =========================================================
# ANALYZE ENVIRONMENT
# =========================================================

@app.post("/api/analyze")
def analyze_environment(
    environmental_data: Dict[str, Any]
):

    print("\n========================================")
    print("NEW ENVIRONMENTAL ANALYSIS REQUEST")
    print("========================================")

    print(environmental_data)

    try:

        result = analyze(
            environmental_data
        )

        print("\nAnalysis result:")
        print(result)

        return result

    except Exception as error:

        print(
            "ERROR:",
            repr(error)
        )

        return {
            "status": "error",

            "diagnosis":
                "The environmental analysis encountered an internal error.",

            "recommendations": [],

            "retrieved_evidence": [],

            "conversation_summary":
                str(error),

            "error":
                str(error),
        }


# =========================================================
# FOLLOW-UP CHAT
# =========================================================

@app.post("/api/chat")
def follow_up_chat(
    message: Dict[str, Any]
):

    user_message = str(
        message.get(
            "message",
            ""
        )
    ).strip()

    # Previous environmental context
    region = message.get(
        "region",
        "unknown"
    )

    rainfall = message.get(
        "rainfall_mm",
        500
    )

    land_use = message.get(
        "land_use",
        "unknown"
    )

    ph = message.get(
        "ph",
        6.5
    )

    organic_carbon = message.get(
        "organic_carbon_pct",
        1.0
    )

    moisture = message.get(
        "moisture_pct",
        20
    )

    species_richness = message.get(
        "species_richness",
        5
    )

    habitat_diversity = message.get(
        "habitat_diversity",
        1
    )

    pollution = message.get(
        "pollution",
        "low"
    )

    deforestation = message.get(
        "deforestation",
        "low"
    )

    recommendations = message.get(
        "recommendations",
        []
    )

    # =====================================================
    # NORMALIZE USER MESSAGE
    # =====================================================

    question = user_message.lower()

    # =====================================================
    # FOLLOW-UP: LOW RAINFALL
    # =====================================================

    if (
        "rainfall" in question
        or "rain" in question
        or "dry" in question
        or "water" in question
    ):

        answer = (
            f"Based on your current environmental conditions "
            f"({rainfall} mm annual rainfall and {moisture}% "
            f"soil moisture), water availability is an important "
            f"constraint.\n\n"
            f"For this situation, prioritize practices that "
            f"retain soil moisture and improve soil cover. "
            f"Cover crops or retained crop residues can help "
            f"protect the soil surface, while diversified "
            f"vegetation should be selected according to local "
            f"water availability.\n\n"
            f"Your current land-use system is '{land_use}', "
            f"so diversification should be introduced in a "
            f"way that does not create excessive competition "
            f"for limited water."
        )

    # =====================================================
    # FOLLOW-UP: SOIL
    # =====================================================

    elif (
        "soil" in question
        or "carbon" in question
        or "organic matter" in question
        or "moisture" in question
    ):

        answer = (
            f"Your current soil indicators are: "
            f"pH {ph}, organic carbon {organic_carbon}% "
            f"and soil moisture {moisture}%.\n\n"
            f"The low organic-carbon value makes soil organic "
            f"matter management particularly relevant. "
            f"Maintaining crop residues, suitable cover crops "
            f"and diversified plant inputs can support soil "
            f"carbon and moisture-related functions over time.\n\n"
            f"I recommend measuring soil organic carbon and "
            f"soil moisture periodically so you can compare "
            f"changes against the current baseline."
        )

    # =====================================================
    # FOLLOW-UP: SPECIES
    # =====================================================

    elif (
        "species" in question
        or "biodiversity" in question
        or "animals" in question
        or "birds" in question
        or "insects" in question
        or "pollinator" in question
    ):

        answer = (
            f"Your current species-richness value is "
            f"{species_richness} and habitat-diversity value "
            f"is {habitat_diversity}.\n\n"
            f"To improve biodiversity, focus on increasing "
            f"habitat variety rather than relying on a single "
            f"intervention. Locally suitable native vegetation, "
            f"field margins, flowering strips and diversified "
            f"cropping can provide additional food and shelter "
            f"resources.\n\n"
            f"Track species richness and habitat types over "
            f"time so the effect of the intervention can be "
            f"measured."
        )

    # =====================================================
    # FOLLOW-UP: WHICH RECOMMENDATION
    # =====================================================

    elif (
        "which" in question
        or "best" in question
        or "start" in question
        or "first" in question
        or "priority" in question
    ):

        answer = (
            "The starting point should depend on the main "
            "environmental constraint you want to address.\n\n"
            f"For your current conditions — {organic_carbon}% "
            f"soil organic carbon, {rainfall} mm rainfall, "
            f"{moisture}% soil moisture and '{land_use}' land "
            f"use — soil-cover and moisture-conservation "
            f"measures are a logical first intervention to "
            f"consider.\n\n"
            "After establishing soil cover, you can progressively "
            "increase habitat and crop diversity."
        )

    # =====================================================
    # FOLLOW-UP: TIME
    # =====================================================

    elif (
        "how long" in question
        or "time" in question
        or "months" in question
        or "measure" in question
        or "monitor" in question
    ):

        answer = (
            "Use the current environmental measurements as "
            "your baseline.\n\n"
            "For soil moisture and visible vegetation changes, "
            "monitor more frequently during the growing season. "
            "For soil organic carbon and biodiversity indicators, "
            "use repeated measurements over a longer period "
            "because these indicators generally change more "
            "slowly.\n\n"
            "Useful indicators to track include soil organic "
            "carbon, soil moisture, species richness, habitat "
            "diversity and vegetation cover."
        )

    # =====================================================
    # FOLLOW-UP: GENERAL
    # =====================================================

    else:

        answer = (
            f"I can continue the environmental assessment using "
            f"your previous context: {region}, {rainfall} mm "
            f"rainfall, '{land_use}' land use, {organic_carbon}% "
            f"soil organic carbon and {moisture}% soil moisture.\n\n"
            "Your question can be explored through soil health, "
            "water availability, land use, habitat diversity "
            "and species richness together.\n\n"
            "Try asking something like:\n"
            "• Which recommendation should I start with?\n"
            "• How can I improve biodiversity?\n"
            "• What should I measure after 6 months?\n"
            "• Why is soil carbon important?\n"
            "• Which action is suitable for low rainfall?"
        )

    # =====================================================
    # RESPONSE
    # =====================================================

    return {

        "status": "ok",

        "answer": answer,

        "context": {
            "region": region,
            "rainfall_mm": rainfall,
            "land_use": land_use,
            "organic_carbon_pct": organic_carbon,
            "moisture_pct": moisture,
            "species_richness": species_richness,
            "habitat_diversity": habitat_diversity,
        },

        "conversation": True,
    }