/**
 * Hub da missão Hijack the Truck (Havana).
 * Conecta o DriverHavanaHijack ao motor do jogo.
 */
class DriverHavanaHijackHub {
    static canStart(game) {
        return game?.city?.preset?.id === 'havana' &&
            game.completedMissions?.has('story_havana_lead') &&
            !game.completedMissions?.has('story_havana_hijack');
    }

    static start(game) {
        if (!this.canStart(game)) return false;

        game.missionType = 'story_havana_hijack';
        game.missionTitle = 'HIJACK THE TRUCK';
        game.missionDescription = 'Siga o caminhão de munição, elimine as escoltas e sequestre o caminhão. Leve-o à safehouse sem destruí-lo.';
        game.missionTime = DriverHavanaHijack.LIMIT;
        game.missionActive = true;

        // Spawna o caminhão
        const ts = DriverHavanaHijack.TRUCK_START;
        game.missionTruck = game.spawnTrafficCar
            ? game.spawnTrafficCar(ts.x, ts.z, 'truck')
            : null;

        if (game.missionTruck) {
            DriverHavanaHijack.attachRoute(game.missionTruck);
            game.missionTruck.isMissionTarget = true;
            game.missionTruck.damage = 0;
            game.missionTruck.maxSpeed = 18;
        }

        // Escoltas
        game.missionEscorts = [];
        for (let i = 0; i < DriverHavanaHijack.ESCORT_COUNT; i++) {
            const offset = (i - 0.5) * 12;
            const escort = game.spawnTrafficCar
                ? game.spawnTrafficCar(ts.x + offset, ts.z - 15, 'police')
                : null;
            if (escort) {
                escort.isEscort = true;
                escort.damage = 0;
                game.missionEscorts.push(escort);
            }
        }

        game.havanaHijackDirector = new DriverHavanaHijack();

        // Posiciona o jogador
        if (game.playerCar) {
            const s = DriverHavanaHijack.START;
            game.playerCar.position.set(s.x, 0.5, s.z);
            game.playerCar.rotation.y = s.heading;
        }

        game.showMissionBriefing?.(game.missionTitle, game.missionDescription);
        return true;
    }

    static update(game, dt) {
        if (game.missionType !== 'story_havana_hijack' || !game.havanaHijackDirector)
            return;

        const director = game.havanaHijackDirector;
        const status = director.update(dt, {
            player: game.playerCar?.position,
            truck: game.missionTruck,
            escorts: game.missionEscorts || [],
            mode: game.isOnFoot ? 'onfoot' : 'driving',
            timeLeft: game.missionTime
        });

        // HUD
        const title = document.getElementById('mission-title');
        if (title) title.textContent = status.message;

        if (status.complete) {
            game.completeMission?.('story_havana_hijack', 'CAMINHÃO SEQUESTRADO');
            game.havanaHijackDirector = null;
        } else if (status.failed) {
            game.failMission?.('story_havana_hijack', status.failed);
            game.havanaHijackDirector = null;
        }
    }
}
