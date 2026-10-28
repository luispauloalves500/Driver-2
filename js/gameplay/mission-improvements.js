/**
 * Melhorias iniciais para o clone de Driver 2.
 * Adiciona feedback visual extra e objetivos secundários simples.
 * Integrar no engine depois.
 */
class DriverMissionImprovements {
    static enhanceHUD(g) {
        // Exemplo: mostrar dica de missão regional se ativa
        if (g.regionalState && g.regionalState.type) {
            console.log('Missão regional ativa:', g.regionalState.type);
        }
    }

    static addSecretBonus(g) {
        // Bônus secreto: encontrar 3 cones dourados desbloqueia carro extra (placeholder)
        if (!g.secretConesFound) g.secretConesFound = 0;
    }
}

// Placeholder para expansão futura: mais missões de Vegas/Rio, mapas mais fiéis, cutscenes.
