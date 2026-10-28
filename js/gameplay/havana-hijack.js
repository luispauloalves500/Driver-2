/**
 * Havana 10 — Hijack the Truck.
 * Siga o caminhão de munição, elimine as escoltas e sequestre o caminhão
 * sem destruí-lo completamente. Entregue na safehouse.
 */
class DriverHavanaHijack {
    static START = Object.freeze({ x: 20, z: -180, heading: 0 });
    static TRUCK_START = Object.freeze({ x: 20, z: -120 });
    static SAFEHOUSE = Object.freeze({ x: -140, z: 180 });
    static ROUTE = Object.freeze([
        { x: 20, z: -40 }, { x: 100, z: -40 }, { x: 100, z: 40 },
        { x: 40, z: 40 }, { x: 40, z: 120 }, { x: -60, z: 120 },
        { x: -60, z: 180 }, { x: -140, z: 180 }
    ]);
    static LIMIT = 240;
    static ESCORT_COUNT = 2;
    static MIN_HIJACK_DAMAGE = 35;   // dano mínimo para forçar o motorista a sair
    static MAX_TRUCK_DAMAGE = 88;    // não pode destruir o caminhão
    static DELIVERY_RADIUS = 22;

    constructor() { this.reset(); }

    reset() {
        this.phase = 'follow';          // follow → clear_escorts → hijack → deliver
        this.escortsCleared = 0;
        this.hijacked = false;
        this.complete = false;
        this.failed = null;
        this.timeInRange = 0;
    }

    static attachRoute(truck) {
        if (!truck) return null;
        truck.scriptedDrive = {
            waypoints: this.ROUTE.map(p => ({ x: p.x, z: p.z })),
            index: 0, done: false, maxSpeed: 18, waitSeconds: 0
        };
        return truck.scriptedDrive;
    }

    update(dt, { player, truck, escorts = [], mode = 'driving', timeLeft = this.constructor.LIMIT } = {}) {
        const seconds = Math.max(0, Math.min(0.05, Number(dt) || 0));
        if (this.complete || this.failed) return this.status(player, truck);

        if (!truck || !player) {
            this.failed = 'missing_target';
            return this.status(player, truck);
        }

        // Conta escoltas destruídas
        const aliveEscorts = escorts.filter(e => e && (e.damage || 0) < 95);
        this.escortsCleared = this.constructor.ESCORT_COUNT - aliveEscorts.length;

        const dist = Math.hypot(player.x - truck.x, player.z - truck.z);
        const truckDamage = truck.damage || 0;

        if (truckDamage >= this.constructor.MAX_TRUCK_DAMAGE) {
            this.failed = 'truck_destroyed';
            return this.status(player, truck);
        }

        if (timeLeft <= 0) {
            this.failed = 'timeout';
            return this.status(player, truck);
        }

        // Fases
        if (this.phase === 'follow' && this.escortsCleared >= this.constructor.ESCORT_COUNT) {
            this.phase = 'hijack';
        }

        if (this.phase === 'hijack' && truckDamage >= this.constructor.MIN_HIJACK_DAMAGE && dist < 8) {
            this.hijacked = true;
            this.phase = 'deliver';
            // Transfere controle (simulado — o motor deve trocar o playerCar)
        }

        if (this.phase === 'deliver') {
            const toSafe = Math.hypot(truck.x - this.constructor.SAFEHOUSE.x,
                                       truck.z - this.constructor.SAFEHOUSE.z);
            if (toSafe < this.constructor.DELIVERY_RADIUS && mode === 'driving') {
                this.timeInRange += seconds;
                if (this.timeInRange > 2.5) this.complete = true;
            } else {
                this.timeInRange = Math.max(0, this.timeInRange - seconds);
            }
        }

        return this.status(player, truck);
    }

    status(player, truck) {
        const dist = player && truck ? Math.hypot(player.x - truck.x, player.z - truck.z) : Infinity;
        let message = 'SIGA O CAMINHÃO';
        if (this.phase === 'hijack') message = 'ELIMINE AS ESCOLTAS E SEQUESTRE O CAMINHÃO';
        if (this.phase === 'deliver') message = 'LEVE O CAMINHÃO ATÉ A SAFEHOUSE';
        if (this.complete) message = 'CAMINHÃO ENTREGUE';

        return {
            phase: this.phase,
            complete: this.complete,
            failed: this.failed,
            hijacked: this.hijacked,
            escortsCleared: this.escortsCleared,
            truckDamage: truck?.damage || 0,
            distance: dist,
            message
        };
    }
}
