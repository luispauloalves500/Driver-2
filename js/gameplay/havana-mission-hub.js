/**
 * Hub da primeira missão de Havana: Follow Up the Lead.
 * Conecta o DriverHavanaLead ao motor do jogo.
 */
class DriverHavanaMissionHub {
    static canStart(game) {
        return game?.city?.preset?.id === 'havana' &&
            !game.completedMissions?.has('story_havana_lead');
    }

    static start(game) {
        if (!this.canStart(game)) return false;

        game.missionType = 'story_havana_lead';
        game.missionTitle = 'FOLLOW UP THE LEAD';
        game.missionDescription = 'Siga o brasileiro tatuado sem ser visto. Mantenha distância segura até o encontro nos cais.';
        game.missionTime = DriverHavanaLead.LIMIT;
        game.missionActive = true;

        // Cria o alvo (carro do suspeito)
        const start = DriverHavanaLead.SUSPECT;
        game.missionTarget = game.spawnTrafficCar
            ? game.spawnTrafficCar(start.x, start.z, 'green')
            : null;

        if (game.missionTarget) {
            DriverHavanaLead.attachRoute(game.missionTarget);
            game.missionTarget.isMissionTarget = true;
            game.missionTarget.damage = 0;
        }

        game.havanaLeadDirector = new DriverHavanaLead();

        // Posiciona o jogador
        if (game.playerCar) {
            game.playerCar.position.set(
                DriverHavanaLead.START.x,
                0.5,
                DriverHavanaLead.START.z
            );
            game.playerCar.rotation.y = DriverHavanaLead.START.heading;
        }

        game.showMissionBriefing?.(
            game.missionTitle,
            game.missionDescription
        );

        return true;
    }

    static update(game, dt) {
        if (game.missionType !== 'story_havana_lead' || !game.havanaLeadDirector)
            return;

        const director = game.havanaLeadDirector;
        const status = director.update(dt, {
            player: game.playerCar?.position,
            target: game.missionTarget,
            mode: game.isOnFoot ? 'onfoot' : 'driving',
            timeLeft: game.missionTime
        });

        // Atualiza HUD
        const hud = document.getElementById('mission-title');
        if (hud) hud.textContent = status.message;

        const progress = document.getElementById('havana-lead-fill');
        if (progress)
            progress.style.width = Math.round(status.progress * 100) + '%';

        if (status.complete) {
            game.completeMission?.('story_havana_lead', 'LEAD CONFIRMADO');
            game.havanaLeadDirector = null;
        } else if (status.failed) {
            game.failMission?.('story_havana_lead', status.failed);
            game.havanaLeadDirector = null;
        }
    }
}
