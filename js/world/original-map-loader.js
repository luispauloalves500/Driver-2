/**
 * Stub para carregar mapas originais exportados do Driver 2 (OBJ/GLB via OpenDriver2Tools).
 * Substituirá a grade procedural quando os assets estiverem prontos.
 */
class OriginalMapLoader {
    static async load(scene, cityId, glbUrl) {
        if (!glbUrl) {
            console.warn('OriginalMapLoader: nenhum GLB fornecido para', cityId);
            return null;
        }
        const loader = new THREE.GLTFLoader();
        return new Promise((resolve, reject) => {
            loader.load(glbUrl, (gltf) => {
                const model = gltf.scene;
                model.name = 'original-map-' + cityId;
                // Ajustes básicos de escala/posição (ajustar conforme export)
                model.scale.set(1, 1, 1);
                model.position.set(0, 0, 0);
                scene.add(model);
                console.log('Mapa original carregado:', cityId);
                resolve(model);
            }, undefined, reject);
        });
    }

    static getRecommendedPath(cityId) {
        return `./assets/maps/${cityId}.glb`;
    }
}
