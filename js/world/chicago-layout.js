/**
 * Chicago Layout — posicionamento aproximado dos bairros e landmarks
 * principais do Driver 2 (Wrigleyville, Gold Coast, Loop, Grant Park,
 * Navy Pier, Chinatown, Lower Wacker, etc.).
 *
 * Camada visual + marcadores de bairro. Não altera física nem colisores
 * existentes. Usa o sistema de packing do projeto.
 */
class DriverChicagoLayout {
    static isChicago(city) {
        return city?.preset?.id === 'chicago';
    }

    // Posições aproximadas (escala do mapa atual ~840 unidades)
    static DISTRICTS = {
        wrigleyville: { x: -80, z: 280, name: 'WRIGLEYVILLE', color: 0x4ade80 },
        lincolnPark: { x: 40, z: 200, name: 'LINCOLN PARK', color: 0x22c55e },
        goldCoast: { x: 160, z: 120, name: 'GOLD COAST', color: 0xfbbf24 },
        downtown: { x: 0, z: -40, name: 'DOWNTOWN / LOOP', color: 0x60a5fa },
        grantPark: { x: 80, z: -140, name: 'GRANT PARK', color: 0x34d399 },
        navyPier: { x: 220, z: 40, name: 'NAVY PIER', color: 0x38bdf8 },
        greektown: { x: -180, z: -80, name: 'GREEKTOWN', color: 0xf97316 },
        chinatown: { x: -40, z: -240, name: 'CHINATOWN', color: 0xef4444 },
        prairieAve: { x: 120, z: -220, name: 'PRAIRIE AVE', color: 0xa78bfa },
        meigs: { x: 240, z: -180, name: 'MEIGS FIELD', color: 0x94a3b8 }
    };

    static build(city) {
        if (!this.isChicago(city)) return;

        const group = new THREE.Group();
        group.name = 'chicago-layout-markers';
        city.cityGroup.add(group);

        // Marcadores de bairro (baixos, não colidem)
        for (const [key, d] of Object.entries(this.DISTRICTS)) {
            const marker = new THREE.Mesh(
                new THREE.CylinderGeometry(8, 8, 0.4, 16),
                new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.35 })
            );
            marker.position.set(d.x, 0.25, d.z);
            marker.name = 'district-' + key;
            group.add(marker);

            // Placa de nome (opcional, só visual)
            const label = this.makeLabel(d.name, d.color);
            label.position.set(d.x, 12, d.z);
            group.add(label);
        }

        // Reforço visual do Rio Chicago (já existe canal em z~50)
        this.enhanceRiver(city, group);

        // Wrigley Field (estadio) — posição mais norte
        this.buildWrigley(city, group, -80, 310);

        // Navy Pier simplificado
        this.buildNavyPier(city, group, 240, 60);

        city.chicagoLayout = {
            version: 1,
            districts: Object.keys(this.DISTRICTS).length,
            group
        };
    }

    static makeLabel(text, color) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 256, 64);
        ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(24, 6), mat);
        plane.lookAt(0, 0, 1); // orienta para a câmera aproximada
        return plane;
    }

    static enhanceRiver(city, parent) {
        // Faixas de margens mais definidas ao longo do canal existente
        const parts = [];
        for (let x = -360; x <= 360; x += 40) {
            parts.push([x, 0.15, 32, 38, 0.2, 3.5, 0x475569]);
            parts.push([x, 0.15, 68, 38, 0.2, 3.5, 0x475569]);
        }
        if (typeof DriverSpecialStructures !== 'undefined') {
            DriverSpecialStructures.pack(parent, parts, 'chicago-river-enhanced');
        }
    }

    static buildWrigley(city, parent, x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        group.name = 'wrigley-field';

        // Campo
        const field = new THREE.Mesh(
            new THREE.BoxGeometry(36, 0.3, 28),
            new THREE.MeshLambertMaterial({ color: 0x22c55e })
        );
        field.position.y = 0.2;
        group.add(field);

        // Arquibancadas simples
        const standMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
        const stand = new THREE.Mesh(new THREE.BoxGeometry(40, 6, 6), standMat);
        stand.position.set(0, 3, -16);
        group.add(stand);

        parent.add(group);
    }

    static buildNavyPier(city, parent, x, z) {
        const pier = new THREE.Mesh(
            new THREE.BoxGeometry(60, 1.2, 18),
            new THREE.MeshLambertMaterial({ color: 0x64748b })
        );
        pier.position.set(x, 0.6, z);
        pier.name = 'navy-pier';
        parent.add(pier);

        // Ferris wheel simplificado
        const wheel = new THREE.Mesh(
            new THREE.TorusGeometry(8, 0.4, 8, 24),
            new THREE.MeshLambertMaterial({ color: 0xfbbf24 })
        );
        wheel.position.set(x + 10, 10, z);
        wheel.rotation.y = Math.PI / 2;
        parent.add(wheel);
    }
}
