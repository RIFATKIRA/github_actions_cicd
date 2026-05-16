import { useState, useEffect, useRef } from "react";
import "./App.css";

/* ─── KNOWLEDGE DATA ─── */
const TOPICS = [
  {
    id: "tinyml",
    label: "EDGE AI",
    color: "cyan",
    icon: "◈",
    title: "TinyML & On-Device Inference",
    tagline: "Running AI models directly on microcontrollers",
    summary:
      "TinyML is the practice of deploying machine learning models on microcontrollers and embedded processors with < 1 MB of RAM. Instead of sending raw sensor data to the cloud, the device makes predictions locally — enabling real-time decisions with zero network latency.",
    facts: [
      { label: "Inference speed", value: "< 10ms", sub: "on STM32H7 with INT8 model" },
      { label: "Model size", value: "< 256 KB", sub: "post-quantization target" },
      { label: "Power draw", value: "< 5 mW", sub: "typical MCU inference" },
      { label: "Market size", value: "$2.5B", sub: "TinyML market by 2030" },
    ],
    concepts: [
      { name: "Quantization", desc: "Converts float32 weights to INT8, shrinking model size ~4× with minimal accuracy loss. Key for fitting models into MCU flash memory." },
      { name: "Pruning", desc: "Removes low-importance weights from a neural network before deployment, reducing compute load without retraining from scratch." },
      { name: "Knowledge Distillation", desc: "A large 'teacher' model trains a compact 'student' model to mimic its outputs — delivering near-equal accuracy in a fraction of the size." },
      { name: "TFLite Micro", desc: "TensorFlow Lite for Microcontrollers: a C++ library with no OS or standard library dependency, designed to run inference on bare-metal hardware." },
    ],
    pipeline: ["Train in PyTorch", "→", "Export ONNX", "→", "Quantize (INT8)", "→", "Convert TFLite", "→", "Flash to MCU"],
  },
  {
    id: "cv",
    label: "COMPUTER VISION",
    color: "cyan",
    icon: "◉",
    title: "Computer Vision",
    tagline: "Teaching machines to see and understand the world",
    summary:
      "Computer Vision (CV) is the field of enabling machines to interpret and understand visual information from images or video. Modern CV is dominated by deep learning — specifically Convolutional Neural Networks (CNNs) and increasingly Vision Transformers (ViTs).",
    facts: [
      { label: "YOLO speed", value: "~30ms", sub: "YOLOv8n on Raspberry Pi 5" },
      { label: "ImageNet top-1", value: "91.1%", sub: "state-of-the-art (2024)" },
      { label: "CNN layers", value: "3 types", sub: "conv, pool, fully-connected" },
      { label: "OpenCV ops", value: "2500+", sub: "built-in image functions" },
    ],
    concepts: [
      { name: "Convolution", desc: "A sliding filter kernel sweeps over an image, detecting local features like edges, textures, and shapes. Stacked layers detect progressively complex patterns." },
      { name: "Object Detection", desc: "Unlike classification, detection outputs bounding boxes + class labels. YOLO (You Only Look Once) does this in a single forward pass — hence 'real-time'." },
      { name: "Feature Extraction", desc: "Backbone networks (ResNet, MobileNet) pre-trained on ImageNet can be reused as feature extractors for custom tasks via transfer learning." },
      { name: "Image Segmentation", desc: "Assigns a class label to every pixel. Semantic segmentation labels regions; instance segmentation separates individual objects of the same class." },
    ],
    pipeline: ["Raw Image", "→", "Preprocessing", "→", "CNN Backbone", "→", "Feature Map", "→", "Detection Head", "→", "Bounding Boxes"],
  },
  {
    id: "freertos",
    label: "FIRMWARE",
    color: "amber",
    icon: "⬢",
    title: "FreeRTOS & Real-Time Systems",
    tagline: "Deterministic scheduling for embedded applications",
    summary:
      "FreeRTOS is an open-source, lightweight real-time operating system (RTOS) designed for microcontrollers with as little as a few KB of RAM. It provides deterministic task scheduling — meaning you can guarantee that a task will run within a specific time window, critical for safety-sensitive applications.",
    facts: [
      { label: "Kernel footprint", value: "~6–12 KB", sub: "flash memory usage" },
      { label: "Min RAM", value: "< 1 KB", sub: "minimal config" },
      { label: "Scheduling", value: "Preemptive", sub: "priority-based + time-sliced" },
      { label: "Platforms", value: "40+", sub: "supported architectures" },
    ],
    concepts: [
      { name: "Task Scheduling", desc: "The FreeRTOS kernel assigns CPU time to tasks based on priority. A higher-priority task always preempts a lower one — crucial for time-critical ISR handling." },
      { name: "Semaphores & Mutexes", desc: "Synchronization primitives that prevent race conditions when multiple tasks share resources like UART buffers or sensor registers." },
      { name: "DMA (Direct Memory Access)", desc: "Hardware feature that transfers data between memory and peripherals without CPU involvement, freeing the processor for computation during I/O." },
      { name: "OTA Updates", desc: "Over-the-Air firmware updates use an A/B partition scheme: new firmware flashes to the inactive partition; device reboots and verifies before committing." },
    ],
    pipeline: ["Hardware Init", "→", "RTOS Kernel Start", "→", "Task Scheduler", "→", "ISR / Callbacks", "→", "Peripheral Drivers", "→", "Application Logic"],
  },
  {
    id: "mqtt",
    label: "IoT PROTOCOL",
    color: "amber",
    icon: "⬡",
    title: "MQTT & IoT Communication",
    tagline: "Lightweight pub/sub protocol for constrained devices",
    summary:
      "MQTT (Message Queuing Telemetry Transport) is a publish/subscribe messaging protocol designed for constrained devices and low-bandwidth, high-latency networks. A device 'publishes' data to a topic on a broker; any subscriber to that topic instantly receives the message — enabling scalable, decoupled IoT architectures.",
    facts: [
      { label: "Header size", value: "2 bytes", sub: "minimum fixed header" },
      { label: "QoS levels", value: "3", sub: "0=fire, 1=at-least-once, 2=exactly-once" },
      { label: "Port", value: "1883 / 8883", sub: "plain / TLS encrypted" },
      { label: "Max payload", value: "256 MB", sub: "theoretical; use < 1 KB in practice" },
    ],
    concepts: [
      { name: "Publish/Subscribe", desc: "Decouples producers from consumers. An ESP32 sensor publishes to 'factory/line1/temp'; a cloud dashboard subscribes — they never communicate directly." },
      { name: "Quality of Service", desc: "QoS 0: no guarantee. QoS 1: at least once (may duplicate). QoS 2: exactly once (handshake). Higher QoS = more overhead." },
      { name: "Retained Messages", desc: "The broker stores the last message on a topic. New subscribers immediately receive the most recent value without waiting for the next publish." },
      { name: "MQTT + Kafka Bridge", desc: "MQTT handles real-time device connectivity; Kafka handles downstream scalable storage and processing. Bridging both covers the full data pipeline." },
    ],
    pipeline: ["Sensor", "→", "MQTT Publish", "→", "Broker", "→", "MQTT Subscribe", "→", "Node.js / Backend", "→", "Database / ML Pipeline"],
  },
  {
    id: "mlops",
    label: "MLOPS",
    color: "cyan",
    icon: "◈",
    title: "MLOps & Model Lifecycle",
    tagline: "Automating the ML pipeline from experiment to production",
    summary:
      "MLOps applies DevOps principles to machine learning. The goal is to automate the end-to-end ML lifecycle: data ingestion, experiment tracking, model training, evaluation, deployment, and monitoring — so models don't rot in Jupyter notebooks but continuously improve in production.",
    facts: [
      { label: "Faster cycles", value: "30–40%", sub: "decision cycle improvement reported" },
      { label: "Cost reduction", value: "20–30%", sub: "operational cost drop at edge" },
      { label: "Key tools", value: "MLflow / DagsHub", sub: "experiment tracking standards" },
      { label: "Drift detection", value: "Automated", sub: "triggers retraining pipeline" },
    ],
    concepts: [
      { name: "Experiment Tracking", desc: "MLflow and DagsHub log every run: hyperparameters, metrics, artifacts, and model versions. Makes experiments reproducible and comparable." },
      { name: "Model Registry", desc: "A versioned store for trained models. Supports staging → production promotion with rollback. CI/CD pipelines fetch the 'production' alias automatically." },
      { name: "Data Drift", desc: "When real-world input distribution shifts away from training data, model accuracy degrades. Drift detectors monitor feature statistics and trigger retraining." },
      { name: "Edge MLOps", desc: "On MCU devices, models are baked into firmware. Updates require OTA flashing. The pipeline must version control model + firmware together as one artifact." },
    ],
    pipeline: ["Raw Data", "→", "DVC / Versioning", "→", "Train + Track (MLflow)", "→", "Evaluate", "→", "Register Model", "→", "Deploy / OTA Flash"],
  },
  {
    id: "llm",
    label: "LLM × RAG",
    color: "cyan",
    icon: "◎",
    title: "LLMs & RAG Systems",
    tagline: "Grounding large language models with real-world knowledge",
    summary:
      "RAG (Retrieval-Augmented Generation) solves LLM hallucination by giving the model access to a curated knowledge base at inference time. Instead of relying solely on training data, the system retrieves relevant documents, injects them into the prompt context, and lets the LLM reason over fresh, accurate information.",
    facts: [
      { label: "Context window", value: "200K tokens", sub: "Claude 3 / Gemini 1.5" },
      { label: "Embedding dim", value: "1536", sub: "OpenAI text-embedding-3-small" },
      { label: "Vector search", value: "< 10ms", sub: "FAISS approximate nearest neighbor" },
      { label: "RAG accuracy", value: "+37%", sub: "vs base LLM on domain Q&A" },
    ],
    concepts: [
      { name: "Embeddings", desc: "Text chunks are encoded as dense vectors in high-dimensional space. Semantically similar texts cluster near each other — enabling similarity search." },
      { name: "Vector Database", desc: "Stores embeddings with metadata. FAISS, ChromaDB, or Pinecone enable sub-millisecond nearest-neighbor search across millions of chunks." },
      { name: "Prompt Engineering", desc: "Structuring prompts with retrieved context, system instructions, and few-shot examples significantly affects LLM output quality and reliability." },
      { name: "LLM Fine-tuning", desc: "LoRA (Low-Rank Adaptation) fine-tunes LLMs by training small adapter matrices instead of all weights — enabling domain adaptation with minimal GPU compute." },
    ],
    pipeline: ["User Query", "→", "Embed Query", "→", "Vector Search", "→", "Retrieve Chunks", "→", "Build Prompt", "→", "LLM Generates Answer"],
  },
  {
    id: "pcb",
    label: "HARDWARE",
    color: "amber",
    icon: "⬡",
    title: "PCB Design & Signal Integrity",
    tagline: "From schematic to manufacturable circuit board",
    summary:
      "PCB (Printed Circuit Board) design translates an electronic schematic into a physical layout that can be manufactured. At higher frequencies and faster edge rates, signal integrity becomes critical — traces behave as transmission lines, and impedance mismatches cause reflections that corrupt data.",
    facts: [
      { label: "Trace impedance", value: "50 Ω", sub: "standard single-ended target" },
      { label: "Min trace width", value: "0.1 mm", sub: "standard fab design rule" },
      { label: "Layer stackup", value: "4–6 layers", sub: "typical for RF / high-speed" },
      { label: "Decoupling cap", value: "100 nF", sub: "per power pin, placed close" },
    ],
    concepts: [
      { name: "Controlled Impedance", desc: "High-speed signals (USB, Ethernet, MIPI) require traces with controlled impedance matching the driver output. Deviation causes reflections and bit errors." },
      { name: "Ground Planes", desc: "Solid copper ground pours on internal layers reduce EMI, provide return current paths, and stabilize power supply noise across the board." },
      { name: "Differential Pairs", desc: "High-speed protocols like USB, LVDS, and PCIe use two complementary signals. Noise couples equally to both, cancelling at the receiver — giving noise immunity." },
      { name: "Power Integrity", desc: "Decoupling capacitors placed close to IC power pins act as local energy reservoirs, suppressing voltage transients when logic switches at high frequency." },
    ],
    pipeline: ["Schematic Capture", "→", "Component Footprints", "→", "PCB Layout", "→", "DRC Check", "→", "Gerber Export", "→", "Send to Fab"],
  },
  {
    id: "ble",
    label: "WIRELESS",
    color: "amber",
    icon: "⬢",
    title: "BLE & Wireless Protocols",
    tagline: "Low-power wireless communication for IoT nodes",
    summary:
      "BLE (Bluetooth Low Energy) is designed for devices that transmit small amounts of data infrequently and must run on a coin cell for years. Unlike classic Bluetooth, BLE uses duty-cycled radio bursts — the radio sleeps most of the time, waking only to advertise or exchange data.",
    facts: [
      { label: "Range", value: "10–100m", sub: "depending on power & antenna" },
      { label: "Data rate", value: "1–2 Mbps", sub: "BLE 4.2 / 5.0" },
      { label: "Sleep current", value: "< 10 µA", sub: "typical Nordic nRF52 deep sleep" },
      { label: "Advertising", value: "20ms–10s", sub: "configurable interval" },
    ],
    concepts: [
      { name: "GATT Profile", desc: "Generic Attribute Profile defines how BLE devices expose data as 'services' containing 'characteristics'. A heart rate sensor exposes a Heart Rate Service with HR Measurement characteristic." },
      { name: "Advertisement Packets", desc: "Devices broadcast small payloads (up to 31 bytes) without pairing. Beacons use this for location triggers; sensors use it for connectionless data." },
      { name: "Connection Intervals", desc: "After pairing, master and slave agree on a connection interval (7.5ms–4s). Longer intervals save power; shorter intervals reduce latency." },
      { name: "CoAP Protocol", desc: "Constrained Application Protocol: RESTful protocol for IoT. Unlike HTTP, CoAP runs over UDP, has tiny headers, and supports multicast — ideal for constrained nodes." },
    ],
    pipeline: ["Sensor Data", "→", "BLE Advertise / Connect", "→", "GATT Write", "→", "Central Device", "→", "Wi-Fi Gateway", "→", "MQTT Broker"],
  },
];

const TECH_STACK = {
  ai: [
    { name: "PyTorch", note: "Primary deep learning framework" },
    { name: "scikit-learn", note: "Classical ML algorithms" },
    { name: "OpenCV", note: "Computer vision processing" },
    { name: "YOLO", note: "Real-time object detection" },
    { name: "TFLite / ONNX", note: "Edge inference runtimes" },
    { name: "LangChain", note: "LLM orchestration" },
    { name: "MLflow", note: "Experiment tracking" },
    { name: "DagsHub", note: "Data + model versioning" },
    { name: "Node.js", note: "Backend API layer" },
    { name: "PostgreSQL", note: "Relational data store" },
  ],
  hw: [
    { name: "STM32 (H7/F4/L4)", note: "ARM Cortex-M MCUs" },
    { name: "ESP32 / ESP8266", note: "Wi-Fi + BLE SoC" },
    { name: "Raspberry Pi", note: "Linux SBC for inference" },
    { name: "FreeRTOS", note: "Real-time OS kernel" },
    { name: "MQTT", note: "IoT publish/subscribe" },
    { name: "CoAP", note: "UDP-based IoT protocol" },
    { name: "KiCad", note: "PCB design & layout" },
    { name: "BLE / GATT", note: "Low-energy wireless" },
    { name: "JTAG / SWD", note: "Hardware debugging" },
    { name: "Node-RED", note: "Visual IoT flow editor" },
  ],
};

const MARQUEE = [
  "TinyML","•","FreeRTOS","•","Quantization","•","MQTT","•","YOLO","•","RAG","•",
  "STM32","•","PyTorch","•","BLE","•","MLflow","•","OpenCV","•","PCB Design","•",
  "Edge AI","•","LangChain","•","OTA Updates","•","CoAP","•","DagsHub","•","INT8","•",
];

/* ─── Hooks ─── */
function useInView(threshold = 0.12) {
  const ref = useRef();
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─── Components ─── */
function Nav({ active, setActive }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const sections = ["overview", "knowledge", "stack", "about"];
  return (
    <nav className={`nav ${scrolled ? "nav-solid" : ""}`}>
      <div className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
        <div className="brand-icon">⬡</div>
        <span className="brand-name">AI × Embedded</span>
        <span className="brand-tag">Knowledge Base</span>
      </div>
      <ul className="nav-links">
        {sections.map(s => (
          <li key={s}>
            <a href={`#${s}`} className={`nav-link ${active === s ? "active" : ""}`} onClick={() => setActive(s)}>
              {s}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Hero() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCount(c => (c + 1) % TOPICS.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="hero" id="overview">
      <div className="hero-grid-bg" />
      <div className="blob blob-cyan" />
      <div className="blob blob-amber" />

      <div className="hero-inner">
        <div className="hero-eyebrow">
          <span className="eyebrow-dot" />
          <span>INTERACTIVE KNOWLEDGE DASHBOARD</span>
        </div>

        <h1 className="hero-title">
          Where <span className="ht-cyan">Intelligence</span>
          <br />meets <span className="ht-amber">Silicon</span>
        </h1>

        <p className="hero-desc">
          An in-depth reference on the technologies that bridge machine learning
          and embedded hardware — from model quantization to RTOS task scheduling,
          MQTT pipelines to PCB signal integrity.
        </p>

        <div className="hero-topic-ticker">
          <span className="ticker-label">Currently covering:</span>
          <span className={`ticker-topic topic-${TOPICS[count].color}`}>
            {TOPICS[count].title}
          </span>
        </div>

        <div className="hero-stats">
          <div className="hstat">
            <div className="hstat-num cyan">8</div>
            <div className="hstat-label">Technology Domains</div>
          </div>
          <div className="hstat-sep" />
          <div className="hstat">
            <div className="hstat-num amber">32</div>
            <div className="hstat-label">Core Concepts Explained</div>
          </div>
          <div className="hstat-sep" />
          <div className="hstat">
            <div className="hstat-num cyan">20+</div>
            <div className="hstat-label">Tools in the Stack</div>
          </div>
        </div>

        <a href="#knowledge" className="hero-cta">
          Explore the Knowledge Base ↓
        </a>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {items.map((item, i) => (
          <span key={i} className={item === "•" ? "mq-sep" : "mq-item"}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function FactCard({ fact }) {
  return (
    <div className="fact-card">
      <div className="fact-value">{fact.value}</div>
      <div className="fact-label">{fact.label}</div>
      <div className="fact-sub">{fact.sub}</div>
    </div>
  );
}

function ConceptCard({ concept, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`concept-card cc-${color} ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
      <div className="cc-header">
        <span className={`cc-name`}>{concept.name}</span>
        <span className="cc-toggle">{open ? "−" : "+"}</span>
      </div>
      {open && <p className="cc-desc">{concept.desc}</p>}
    </div>
  );
}

function PipelineRow({ steps, color }) {
  return (
    <div className="pipeline-row">
      {steps.map((step, i) => (
        step === "→" ? (
          <span key={i} className="pipe-arrow">→</span>
        ) : (
          <span key={i} className={`pipe-step ps-${color}`}>{step}</span>
        )
      ))}
    </div>
  );
}

function TopicCard({ topic }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`topic-card tc-${topic.color} ${inView ? "visible" : ""}`} id={`topic-${topic.id}`}>
      <div className="tc-header">
        <div className="tc-meta">
          <span className={`tc-label lbl-${topic.color}`}>{topic.label}</span>
          <span className={`tc-icon ic-${topic.color}`}>{topic.icon}</span>
        </div>
        <h2 className="tc-title">{topic.title}</h2>
        <p className="tc-tagline">{topic.tagline}</p>
      </div>

      <div className="tc-body">
        <div className="tc-summary">
          <div className="tc-section-label">What is it?</div>
          <p className="tc-text">{topic.summary}</p>
        </div>

        <div className="tc-facts">
          {topic.facts.map((f, i) => <FactCard key={i} fact={f} />)}
        </div>

        <div className="tc-concepts">
          <div className="tc-section-label">Core Concepts</div>
          <div className="concepts-grid">
            {topic.concepts.map((c, i) => <ConceptCard key={i} concept={c} color={topic.color} />)}
          </div>
        </div>

        <div className="tc-pipeline">
          <div className="tc-section-label">Typical Pipeline</div>
          <PipelineRow steps={topic.pipeline} color={topic.color} />
        </div>
      </div>
    </div>
  );
}

function KnowledgeSection() {
  const [ref, inView] = useInView(0.05);
  return (
    <section className="section" id="knowledge">
      <div ref={ref} className={`sec-head ${inView ? "visible" : ""}`}>
        <div className="sec-label">DEEP DIVE</div>
        <h2 className="sec-title">Knowledge Base</h2>
        <p className="sec-desc">
          Each domain explained: what it is, key metrics, core concepts, and the typical workflow pipeline.
          Click any concept to expand it.
        </p>
      </div>
      <div className="topics-list">
        {TOPICS.map(t => <TopicCard key={t.id} topic={t} />)}
      </div>
    </section>
  );
}

function StackSection() {
  const [ref, inView] = useInView(0.05);
  return (
    <section className="section section-alt-bg" id="stack">
      <div ref={ref} className={`sec-head ${inView ? "visible" : ""}`}>
        <div className="sec-label">TECHNOLOGY STACK</div>
        <h2 className="sec-title">Tools & Technologies</h2>
        <p className="sec-desc">The full toolkit — from cloud training to bare-metal firmware.</p>
      </div>

      <div className="stack-split">
        <div className="stack-col">
          <div className="stack-col-head cyan">
            <span>◈</span> AI × Software Stack
          </div>
          <div className="stack-items">
            {TECH_STACK.ai.map((t, i) => (
              <div key={i} className="stack-item">
                <div className="si-name cyan-text">{t.name}</div>
                <div className="si-note">{t.note}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="stack-divider">
          <div className="sd-line" />
          <div className="sd-icon">×</div>
          <div className="sd-line" />
        </div>

        <div className="stack-col">
          <div className="stack-col-head amber">
            <span>⬡</span> Hardware × Embedded Stack
          </div>
          <div className="stack-items">
            {TECH_STACK.hw.map((t, i) => (
              <div key={i} className="stack-item">
                <div className="si-name amber-text">{t.name}</div>
                <div className="si-note">{t.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const [ref, inView] = useInView();
  return (
    <section className="section" id="about">
      <div ref={ref} className={`about-card ${inView ? "visible" : ""}`}>
        <div className="about-split">
          <div className="about-left">
            <div className="sec-label">ABOUT THIS DASHBOARD</div>
            <h2 className="about-title">Why this exists</h2>
            <p className="about-text">
              This dashboard documents the intersection of AI/ML and embedded systems — a domain
              that sits at the frontier of modern hardware. The goal is to make each technology
              understandable at depth: not just what it is, but how it works, what the real
              numbers look like, and how it fits into a production pipeline.
            </p>
            <p className="about-text">
              Topics span from training deep learning models in PyTorch to deploying them as
              INT8 quantized graphs on STM32 microcontrollers over FreeRTOS, with MQTT pipelines
              feeding data back to cloud MLOps systems for automated retraining.
            </p>
          </div>
          <div className="about-right">
            <div className="about-domain-list">
              {TOPICS.map(t => (
                <a key={t.id} href={`#topic-${t.id}`} className={`adl-item adl-${t.color}`}>
                  <span className={`adl-icon ic-${t.color}`}>{t.icon}</span>
                  <span>{t.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="fb-icon">⬡</span>
          <span className="fb-name">AI × Embedded Knowledge Base</span>
        </div>
        <p className="footer-sub">
          TinyML · FreeRTOS · MQTT · Computer Vision · MLOps · RAG · PCB Design · BLE
        </p>
        <div className="footer-bottom">
          Built with React + Vite · Information sourced from JMLR, AWS, Edge Impulse, Valohai
        </div>
      </div>
    </footer>
  );
}

/* ─── App ─── */
export default function App() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const ids = ["overview", "knowledge", "stack", "about"];
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { threshold: 0.25 }
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="app">
      <Nav active={active} setActive={setActive} />
      <Hero />
      <Marquee />
      <KnowledgeSection />
      <StackSection />
      <AboutSection />
      <Footer />
    </div>
  );
}