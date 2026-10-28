# Análise: O que falta no Clone Driver 2 (Three.js)

## Estado Atual (Outubro 2026)
Projeto funcional e jogável no navegador via GitHub Pages.
- 4 cidades procedurais (Chicago, Havana, Las Vegas, Rio) com landmarks básicos (ponte, Cristo, cassinos).
- Campanha parcial: 8 missões Chicago adaptadas + 1 Havana + stubs para Vegas/Rio.
- Sistemas completos: física arcade, trânsito IA, perseguição policial, danos zonais, pedestres, save localStorage, portas GLB, HUD retrô, clima, radar.
- Modelos GLB custom + fallback procedural + Kenney CC0.

## Principais Gaps para Clone Mais Completo
1. **Mapas fiéis**: Atual é grade 9x9 procedural. Falta reconstrução das ruas/landmarks originais do PS1 (usando tools OpenDriver2 para exportar LEV).
2. **Campanha completa**: Expandir Havana (mais missões), Vegas (3 definidas mas básicas), Rio (3). Implementar lógica exata de tailing, C4, perseguições pre-gravadas.
3. **Assets originais**: Extrair modelos, texturas, áudio (música XM, vozes) do jogo original via OpenDriver2Tools. Atualmente synth + low-poly.
4. **IA avançada**: FreeRoamer Lead AI, comportamentos mais fiéis de civis/polícia.
5. **Cutscenes e Film Director**: Melhorar replays cinemáticos e adicionar cenas.
6. **Performance e fidelidade visual**: Melhor LOD, texturas PS1-like, otimização mobile.
7. **Modos extras**: Getaway, Survival, Gate Racing mais polidos; multiplayer local opcional.
8. **Save e progressão**: Expandir para todas as missões e garagens secretas.

## Próximos Passos Sugeridos
- Integrar `js/gameplay/mission-improvements.js` (adicionado) no engine.
- Priorizar uma cidade (ex: Chicago) com layout mais próximo do original.
- Completar missões regionais com props e objetivos interativos.
- Documentar pipeline de assets do OpenDriver2.

Projeto já é uma base excelente para continuação!
