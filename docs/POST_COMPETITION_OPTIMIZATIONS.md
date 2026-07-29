# Post-Competition Optimizations & Polish Backlog

This backlog tracks performance optimizations and UI polish items to be executed after all Teacher Portal core checkpoints are complete.

---

## 🚀 1. Gemini API Pipeline Latency Reduction
- **Current Symptom**: `/api/analyze` request taking extended time during multi-file vision parsing + validation gate.
- **Planned Optimizations**:
  - Implement streaming response / progress updates via Server-Sent Events (SSE) or WebSockets.
  - Optimize image compression client-side before uploading to reduce payload transfer time.
  - Parallelize validation gate and vision prompt execution where possible.
  - Cache static model context and system prompts.

---

## 🎬 2. Motion Graphic Product Intro
- **Goal**: Create a structured, breathtaking motion-graphic product walkthrough/intro.
- **Planned Features**:
  - Interactive keyframe animation showcasing answer sheet scanning → Learning MRI breakdown.
  - Custom SVG canvas or Lottie / Framer Motion integration.
  - Audio narration sync.

---

## 🎨 3. Student Dashboard & Profile Polish
- **Goal**: Further elevate the visual aesthetics and responsiveness of the Student Portal.
- **Planned Features**:
  - Dynamic subject progress cards with animated progress rings.
  - Interactive strength & weakness radar chart.
  - Seamless dark/light theme toggle refinement (preserving default light theme).
