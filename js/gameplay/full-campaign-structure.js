/**
 * Estrutura completa da campanha Undercover do Driver 2.
 * Atualiza/expande o DriverCampaignFlow com a lista oficial.
 * Missões ainda não implementadas ficam como stubs.
 */
class FullCampaignStructure {
    static CHICAGO = [
        'story_tipoff',          // 1 Surveillance Tip Off
        'story_witness',         // 2 Chase the Witness
        'story_train',           // 3 Train Pursuit
        'story_drop',            // 4 Tailing the Drop
        'story_safehouse',       // 5 Escape to the Safe House
        'story_intruder',        // 6 Chase the Intruder
        'story_caine',           // 7 Caine's Compound
        'story_leaving'          // 8 Leaving Chicago
    ];

    static HAVANA = [
        'story_havana_lead',     // 9 Follow Up the Lead
        'story_havana_hijack',   // 10 Hijack the Truck
        'story_havana_stop',     // 11 Stop the Truck
        'story_havana_clue',     // 12 Find the Clue
        'story_havana_ferry',    // 13 Escape to Ferry
        'story_havana_docks',    // 14 To the Docks
        'story_havana_jones',    // 15 Back to Jones
        'story_havana_tail',     // 16 Tail Jericho
        'story_havana_pursue',   // 17 Pursue Jericho
        'story_havana_escape'    // 18 Escape the Brazilians
    ];

    static VEGAS = [
        'story_vegas_casino',    // 19 Casino Getaway
        'story_vegas_train',     // 20 Beat the Train
        'story_vegas_bomb',      // 21 Car Bomb
        'story_vegas_bombget',   // 22 Car Bomb Getaway
        'story_vegas_bank',      // 23 Bank Job
        'story_vegas_ambulance', // 24 Steal the Ambulance
        'story_vegas_stake',     // 25 Stake Out
        'story_vegas_keys',      // 26 Steal the Keys
        'story_vegas_c4',        // 27 C4 Deal
        'story_vegas_yard'       // 28 Destroy the Yard
    ];

    static RIO = [
        'story_rio_bus',         // 29 Bus Crash
        'story_rio_cop',         // 30 Steal the Cop Car
        'story_rio_cash',        // 31 Caine's Cash
        'story_rio_save',        // 32 Save Jones
        'story_rio_boat',        // 33 Boat Jump
        'story_rio_trouble',     // 34 Jones in Trouble
        'story_rio_gunman',      // 35 Chase the Gunman
        'story_rio_helicopter',  // 36 Lenny Escaping
        'story_rio_final'        // 37 Pink Lenny Gets Caught
    ];

    static getAll() {
        return {
            chicago: this.CHICAGO,
            havana: this.HAVANA,
            vegas: this.VEGAS,
            rio: this.RIO
        };
    }

    static totalMissions() {
        return this.CHICAGO.length + this.HAVANA.length +
               this.VEGAS.length + this.RIO.length;
    }
}

// Para integrar: substituir os arrays em DriverCampaignFlow
// por FullCampaignStructure.CHICAGO etc.
