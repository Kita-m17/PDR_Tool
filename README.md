# Overview 
PDR-Tool is an explanatory web tool for defeasible reasoning. The project visualises and explains defeasible entailment algorithms. This includes: Rational Closure, Lexicographical Closure, Basic and Minimal Relevant Closure.

# How to Run
We have hosted the tool on Render.com: https://pdr-tool.onrender.com

To run the application locally there is 2 ways.

The first is to run the backend and frontend seperately. Navigate to the `PDR\src\ui`
1. If this is the first time running do `npm install`
2. Every other time use `npm start`
3. Run the `App.java` to start the backend

The other method is to use docker.
1. Make sure docekr desktop is running 
2. in the root of the project run `docker compose up`

# Contributors
- Liam De Saldanha (Relevant Closure)
- Nikita Martin (Rational Closure + Comparison)
- Samukelisiwe Zwane (Lexicographical Closure)

# AI Ackownledgement
Claude was used in the development of this application.