# Pipeline: Exportar mapas originais do Driver 2 (LEV → OBJ/GLB)

## Requisitos
- Cópia legal dos dois CDs do Driver 2 (ISO ou BIN/CUE).
- [REDRIVER2](https://github.com/OpenDriver2/REDRIVER2) instalado e funcionando (extrai os LEV).
- [OpenDriver2Tools](https://github.com/OpenDriver2/OpenDriver2Tools) (DriverLevelTool).

## Exportar uma cidade
```bash
# Exemplo Chicago
DriverLevelTool -format 2 -regformat 3 -textures 1 -explodetpages -models 1 -carmodels 1 -world 1 -lev LEVELS/CHICAGO.lev
```

Arquivos gerados:
- `*.obj` da cidade e modelos
- Texturas TGA/TIM (com transparência original)
- Overhead map TGA

## Converter para o Three.js
1. Abrir o OBJ no Blender.
2. Limpar geometria (opcional: simplificar para web).
3. Exportar como GLB.
4. Colocar em `assets/maps/chicago.glb`.
5. Usar o loader em `js/world/original-map-loader.js` (stub criado).

## Cidades
- Chicago: `CHICAGO.lev`
- Havana: `HAVANA.lev`
- Las Vegas: `VEGAS.lev`
- Rio: `RIO.lev`

## Observações
- O mapa original é grande. Para web, é recomendado fazer LOD ou dividir em chunks.
- Texturas PS1 são de baixa resolução; o projeto já tem factory de texturas procedurais como fallback.
- Não distribuir os arquivos originais (copyright). O repositório só deve conter o código e assets CC0/criados.

Próximo passo: implementar o carregamento progressivo do GLB no `CityBuilder`.
