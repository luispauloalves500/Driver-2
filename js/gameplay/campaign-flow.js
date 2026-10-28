/**
 * Fluxo contínuo de campanha Driver 2.
 * Usa FullCampaignStructure quando disponível.
 */
class DriverCampaignFlow {
    static get CHICAGO() {
        return (typeof FullCampaignStructure !== 'undefined')
            ? FullCampaignStructure.CHICAGO
            : ['story_tipoff','story_witness','story_train','story_drop',
               'story_safehouse','story_intruder','story_caine','story_leaving'];
    }
    static get HAVANA() {
        return (typeof FullCampaignStructure !== 'undefined')
            ? FullCampaignStructure.HAVANA
            : ['story_havana_lead'];
    }
    static get VEGAS() {
        return (typeof FullCampaignStructure !== 'undefined')
            ? FullCampaignStructure.VEGAS
            : ['story_vegas_ambulance','story_vegas_c4','story_vegas_heist'];
    }
    static get RIO() {
        return (typeof FullCampaignStructure !== 'undefined')
            ? FullCampaignStructure.RIO
            : ['story_rio_barge','story_rio_jericho','story_rio_helicopter'];
    }

    static next(chapter, completed) {
        const list = this[chapter?.toUpperCase()] || this.CHICAGO;
        for (const type of list) {
            if (!completed?.has(type)) return type;
        }
        return null;
    }

    static nextChapter(chapter, completed) {
        if (this.next(chapter, completed)) return null;
        return ({chicago:'havana', havana:'vegas', vegas:'rio'})[chapter] || null;
    }

    static chapterTitle(chapter) {
        return ({chicago:'CHICAGO', havana:'HAVANA',
            vegas:'LAS VEGAS', rio:'RIO DE JANEIRO'})[chapter] || chapter;
    }

    static isFailure(title) {
        return /FALH|ESGOTAD|DESTRUÍD[OA]|ESCAPOU|ATINGID[OA]|PONTE FECHOU|FIM DO SURVIVAL|TEMPO ESGOTADO|VIU VOCÊ|TREM PERDIDO|ALVO PERDIDO|VOCÊ FOI DESCOBERTO/i.test(String(title));
    }

    static summarize(title, description, failed, next) {
        return {
            kind: failed ? 'failure' : 'success',
            message: (failed ? 'MISSÃO FALHOU • ' : 'MISSÃO CONCLUÍDA • ') +
                String(title || '').replace(/\s*CONCLUÍDA!?/gi, '').trim(),
            description: String(description || ''),
            next: failed ? 'Retorne ao marcador para tentar novamente' :
                next ? 'Próxima missão disponível no marcador verde (J)' :
                'Explore a cidade ou escolha outro modo pelo MENU'
        };
    }
}
