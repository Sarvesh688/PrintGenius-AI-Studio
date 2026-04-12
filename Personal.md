// In my project, I used Better Auth to handle authentication. It provides both email/password login and social login like Google OAuth, so users can sign in securely without us managing everything from scratch

//“Better Auth is basically an authentication framework that handles:
User login/signup
Session management (cookies/JWT)
Password hashing
Social logins (Google, etc.)
Instead of writing all auth logic manually, it gives a ready-made, secure system.”
//“Google OAuth allows users to log in using their Google account.
//“Google OAuth allows users to log in using their Google account.

In my project, I used Better Auth to implement authentication. It supports both email/password login and Google OAuth. For email login, I handled password hashing using bcrypt. For Google OAuth, users can log in with one click, where Google verifies the user and we receive their profile securely.

Better Auth also manages sessions and JWT tokens, and I used MongoDB to store user and session data. Compared to building auth manually, it reduces complexity and avoids security issues, while still giving us full control unlike services like Firebase or Auth0.

When a user clicks on a product (e.g., Hoodie), they're navigated to `/design/:product_id`.

__Design Page Flow:__

1. __Fetch Product Template__ - Get the template product with printable area and colors
2. __Initialize Canvas Editor__ - Set up Fabric.js canvas with printable area dimensions
3. __Load Product Mockup__ - Display transparent product image as base layer
4. __Enable Artwork Placement__ - Allow users to add AI-generated or uploaded artwork

### __3. Color-Specific Mockups__

Each product color has its own mockup image:

- User selects color → System loads corresponding mockup
- Preview mode merges artwork onto color-specific mockup
- Creates realistic product visualization

### __1. Template vs Display Products__

- __Template__: The base product used in the editor (has printableArea, sizes, basePrice)
- __Display__: Marketing images shown on home page (just for browsing)
- When user clicks any display product, the system loads its corresponding template

## __Interview Explanation Structure__

__Start with the big picture:__

> "The system uses a seed script to populate MongoDB with product templates and display variants. The backend API serves these products categorized by section (catalog/featured), and the React frontend displays them in a responsive grid layout."

__Then dive into technical details:__

> "Each product has a template flag - templates contain the editor configuration (printable area, sizes), while display products are just for browsing. When a user clicks any product, we fetch its corresponding template and load the design studio with Fabric.js canvas."

__Explain the canvas system:__

> "The canvas editor uses the printable area coordinates to ensure artwork is placed correctly. We support multiple product colors, each with its own mockup image. Users can toggle between design mode (transparent overlay) and preview mode (merged mockup) to see how their design looks on the actual product."

__Highlight architectural decisions:__

> "We separate template and display products to allow marketing flexibility while maintaining consistent editor behavior. The two-view system (design/preview) provides both precise editing control and realistic visualization."

This architecture provides a scalable, maintainable system for managing product templates and delivering an intuitive design experience to users.

Auto-approve:Read, Safe Commands, MCP


How to Explain Your AI Artwork Generation Feature

Opening (Big Picture — 30 seconds)

"In my project, users can type a simple text prompt like 'a dragon wearing sunglasses' and the system automatically generates a professional, print-ready artwork using a two-step AI pipeline — completely free. Let me walk you through exactly how it works technically."


Step-by-Step Technical Explanation

Step 1 — User sends a prompt from the Frontend

"The user types their idea into a text input on the React frontend. When they click Generate, the frontend makes a POST request to my Express backend endpoint — POST /api/listing/generate — sending the raw prompt as JSON in the request body."

User types: "a fierce lion with tribal patterns"
     ↓
POST /api/listing/generate
Body: { prompt: "a fierce lion with tribal patterns" }

Step 2 — Groq AI engineers the prompt (Text AI)

"The raw user prompt is too vague for an image model to produce great results. So I first pass it through Groq's API, which runs Meta's Llama 3.3-70b model — a large language model. I give it a detailed system prompt that acts like a 'prompt engineer' — it knows the rules of print-on-demand design, things like always using white backgrounds, specific art styles, color rules, composition guidelines. Groq rewrites the simple user idea into a rich, structured art prompt that image models can understand precisely."

Input:  "a fierce lion with tribal patterns"
          ↓  Groq / Llama 3.3-70b
Output: "Flat vector illustration style, bold graphic aesthetic, 
         1:1 square format, white background. A powerful lion head 
         rendered with intricate geometric tribal patterns covering 
         the mane and face, deep amber eyes with sharp detail..."

"I chose Groq specifically because it's extremely fast — it's one of the fastest inference APIs available — and it has a generous free tier of 14,400 requests per day."


Step 3 — Pollinations.ai generates the image (Image AI)

"Once I have the engineered prompt, I pass it to Pollinations.ai, which uses the FLUX model — a state-of-the-art open source image generation model. The interesting thing here is that Pollinations.ai is completely free and requires no API key. It works simply by constructing a URL with the encoded prompt as a query parameter and making a GET request to their endpoint. It returns a 1024×1024 PNG image directly."

javascriptconst imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}
                  ?width=1024&height=1024&model=flux&nologo=true&seed=${Date.now()}`

"I use Date.now() as the seed so every generation is unique even for the same prompt."


Step 4 — Upload to Cloudinary

"The image URL from Pollinations is then uploaded directly to Cloudinary, my cloud media storage. Cloudinary accepts remote URLs, so I don't need to download the image to my server first — it fetches and stores it directly. This gives me a permanent, CDN-hosted URL for the image."


Step 5 — Background Removal via Remove.bg

"Print-on-demand designs need a transparent background — you don't want a white square on a coloured t-shirt. So I pass the Cloudinary URL to the Remove.bg API, which uses AI to detect and remove the background, returning the image as a PNG with transparency. I then upload that final version back to Cloudinary."


Step 6 — Return to Frontend

"The final Cloudinary URL is returned to the frontend as { artworkUrl }. The React app then loads it into the Fabric.js design editor, where the user can drag, resize, and position the artwork on the product mockup before creating their listing."


Full Flow Summary (Draw This on a Whiteboard)
User Prompt
    │
    ▼
Groq API (Llama 3.3)  ←── SYSTEM_PROMPT (prompt engineering rules)
    │ Returns engineered art prompt
    ▼
Pollinations.ai (FLUX) ←── No API key needed
    │ Returns 1024×1024 image URL
    ▼
Cloudinary Upload  ←── Stores image, returns permanent URL
    │
    ▼
Remove.bg API  ←── Removes background, returns transparent PNG
    │
    ▼
Cloudinary Upload (final)
    │
    ▼
{ artworkUrl } → Frontend → Fabric.js Editor

Likely Interview Questions & Your Answers

Q: Why did you use two separate AI services instead of one?

"Because no single free API does both high-quality text reasoning AND image generation. Groq is optimised for fast LLM inference — it's great at understanding context and following complex instructions. Pollinations handles diffusion-based image generation. Separating them lets me get the best of both worlds while keeping costs at zero."


Q: Why Groq over OpenAI or other LLMs?

"Three reasons — it's free, it's extremely fast (Groq uses custom LPU hardware specifically designed for inference), and Llama 3.3-70b is a very capable open-source model. For prompt engineering, I don't need GPT-4 level reasoning — Llama handles it perfectly."


Q: What is the SYSTEM_PROMPT doing exactly?

"It's essentially a set of rules that tells the AI how to behave as a 'prompt engineer for print-on-demand'. It instructs the model to never invent concepts the user didn't ask for, always use white backgrounds, follow specific output structure — style first, then subject, then texture, typography, color, and composition. It also includes style guides for different aesthetics like street art, gothic, retro, and so on. The result is a consistently structured prompt that image models respond well to."


Q: What happens if Pollinations is slow or down?

"That's a valid concern. Pollinations can sometimes be slower because it's a free public service. In production I would add a timeout with a fallback — either retry logic or switch to a paid service like Together AI's FLUX free tier, which is more reliable. For this project it works well enough for a portfolio demonstration."


Q: Why Remove.bg and not an open source solution?

"Remove.bg gives very accurate results especially around fine details like hair or fur, which matters a lot for artwork. An open source solution like rembg would require running a Python model on my server, adding infrastructure complexity. Since Remove.bg has a free tier and the original project already used it, I kept it as a clean integration."


Q: How does the image get onto the t-shirt mockup?

"That's handled by Cloudinary's image transformation API. When a user requests a mockup, my backend uses Cloudinary's overlay feature — I overlay the artwork image on top of the product mockup image, positioning it precisely using coordinates stored in the product template's printableArea property. The scaling is calculated based on the mockup width and a reference display width stored with each listing."


One-Line Summary for Any Interviewer

"I built a two-step free AI pipeline — Groq's Llama model engineers the user's raw prompt into a precise art description, then Pollinations.ai's FLUX model generates the actual image, which is stored on Cloudinary and cleaned up by Remove.bg before being handed to a Fabric.js design editor."


This covers everything from high-level architecture down to the specific technical decisions. Practice the whiteboard flow and the Q&A and you'll be very well prepared. Good luck! 