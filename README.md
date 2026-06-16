# 🏏 Cricket Ball Physics Simulator In Browser

### 💡 Goal, Limitations & Progress

- **The goal** was to try to simulate real swing, spin, bounce, pace, ball + weather + pitch etc conditions that affect things.
- **the imitation** is that there aren't direct plug-and-play formulas for many of these factors as I had initially thought.
- **Progress**: I am not _actively_ maintaining it, so the todos are tentative.

### 📸 Overview Up Till Now

(Facing 142 kph)

<video src="https://github.com/user-attachments/assets/952399ea-aabd-4a5b-9832-c47e54c186af" style="border-radius: 8px;" controls></video>

### 🧰 Tech Stack Used

- React Three Fiber
- Next.js, TypeScript

### Todos

- add swing complexities
- optimize calculations (remove clones where not needed, remove recalculations or function calls where values are real constants dont change much)
- tune constants in swing, seam, magnus, ground properties, etc
- add gaussian randomness
- add wind
- add presets in leva options
- add better environment/weather
