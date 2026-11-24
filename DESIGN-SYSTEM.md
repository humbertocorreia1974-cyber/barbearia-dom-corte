# Sistema de design — Barbearia Dom Corte
Gerado com **UI/UX Pro Max** (curadoria de estilo + paleta + tipografia).
- **Estilo:** Claymorphism
- **Palavras-chave:** Soft 3D, chunky, playful, toy-like, bubbly, thick borders (3-4px), double shadows, rounded (16-24px)
- **Modo:** light
- **Fontes:** Space Grotesk (títulos) / Inter (corpo)
- **Efeitos:** Inner+outer shadows (subtle, no hard lines), soft press (200ms ease-out), fluffy elements, smooth transitions
- **Padrão de landing:** Hero + Testimonials + CTA — Hero > Problem statement > Solution overview > Testimonials carousel > CTA
- **Evitar:** Boring design + No gamification
## Tokens (CSS vars em `app/globals.css`)
```css
--bg: 210 40% 98%;
--surface: 0 0% 100%;
--surface-2: 221 25% 95%;
--border: 221 20% 88%;
--fg: 221 35% 14%;
--fg-muted: 221 15% 40%;
--brand: 221 83% 50%;
--brand-fg: 0 0% 100%;
--accent: 224 64% 33%;
--accent-fg: 0 0% 100%;
--danger: 0 72% 45%;
--danger-fg: 0 0% 100%;
--warning: 38 92% 50%;
--warning-fg: 20 40% 12%;
--success: 142 70% 33%;
--success-fg: 0 0% 100%;
```
_Use SEMPRE os tokens (`bg-brand`, `text-fg`, `border-border`…), nunca hex cru._