# 🏏 Cricket Ball Physics Simulator In Browser

### 💡 Goal, Limitations & Progress

- **The goal** was to try to simulate real swing, spin, bounce, pace, ball + weather + pitch etc conditions that affect things.
- **The limitation** is that there aren't direct plug-and-play formulas for many of these factors as I had initially thought.
- **Progress**: I am not _actively_ maintaining it, so the todos are tentative.

### 📸 Overview

https://github.com/user-attachments/assets/07740126-be71-4e7c-90fb-79523b9c71b0

### 🧰 Tech Stack Used

- React Three Fiber
- Next.js, TypeScript

### Tentatives

- add swing complexities
- optimize calculations (remove clones where not needed, remove recalculations or function calls where values are real constants dont change much)
- tune constants in swing, seam, magnus, ground properties, etc
- add gaussian randomness
- add wind
- add presets in leva options
- add better environment/weather
