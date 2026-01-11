export type Language = 'en' | 'ms';

export type TranslationKey =
    | 'app_title'
    | 'join_btn'
    | 'admin_btn'
    | 'or'
    | 'join_title'
    | 'enter_name'
    | 'display_name'
    | 'lobby_title'
    | 'players'
    | 'host'
    | 'game_config'
    | 'total_players'
    | 'assigned'
    | 'start_game'
    | 'waiting_host'
    | 'admin_panel'
    | 'game_id'
    | 'kick'
    | 'next_phase'
    | 'victory'
    | 'defeat'
    | 'back_home'
    | 'you_died'
    | 'death_wolf'
    | 'death_vote'
    | 'spectating'
    | 'waiting_for_others'
    | 'night_phase'
    | 'day_phase'
    | 'choose_victim'
    | 'choose_reveal'
    | 'choose_steal'
    | 'choose_swap'
    | 'vote_eliminate'
    | 'vote_cast'
    | 'confirm_action'
    | 'action_submitted'
    | 'desc_werewolf'
    | 'desc_villager'
    | 'desc_seer'
    | 'desc_robber'
    | 'desc_troublemaker'
    | 'desc_minion'
    | 'desc_tanner'
    | 'desc_drunk'
    | 'desc_insomniac'
    | 'revealed_info'
    | 'win_werewolf'
    | 'win_tanner'
    | 'win_villager'
    | 'village_safe'
    | 'village_destroyed'
    | 'help_wolves'
    | 'close_eyes'
    | 'enter_village'
    | 'game_not_found'
    | 'waiting_players'
    | 'host_configuring'
    | 'reset_lobby'
    | 'confirm_reset'
    | 'needed'
    | 'too_many'
    | 'role_distribution'
    | 'seconds'
    | 'waiting_for' | 'click_to_flip' | 'tap_to_reveal' | 'continue' | 'wake_check' | 'check_end_night'
    | 'insomniac_role' | 'center_cards' | 'your_role' | 'player_menu' | 'resume_game' | 'exit_menu'
    | 'found_wolf' | 'teammate' | 'no_wolves' | 'inst_default' | 'inst_seer' | 'inst_drunk' | 'inst_insomniac';

export const translations: Record<Language, Record<TranslationKey, string>> = {
    en: {
        app_title: 'Werewolf',
        join_btn: 'Join as Player',
        admin_btn: 'Enter as Host',
        or: 'Or',
        join_title: 'Join the Village',
        enter_name: 'Enter your name',
        display_name: 'Display Name',
        lobby_title: 'LOBBY',
        players: 'Players',
        host: 'HOST',
        game_config: 'Game Configuration',
        total_players: 'Total Players',
        assigned: 'Assigned',
        start_game: 'START GAME',
        waiting_host: 'Waiting for Host',
        admin_panel: 'Admin Panel',
        game_id: 'GAME ID',
        kick: 'Kick',
        next_phase: 'Next Phase',
        victory: 'VICTORY',
        defeat: 'DEFEAT',
        back_home: 'Back to Home',
        you_died: 'YOU DIED',
        death_wolf: 'You were mauled by a werewolf in the dead of night.',
        death_vote: 'The village has cast you out into the void.',
        spectating: 'You are now haunting the village as a ghost.',
        waiting_for_others: 'Waiting for others to finish...',
        night_phase: 'Night Phase',
        day_phase: 'Day Phase',
        choose_victim: 'Choose a victim via majority vote.',
        choose_reveal: 'Choose a player to reveal their role.',
        choose_steal: 'Choose a player to steal their role.',
        choose_swap: 'Choose TWO players to swap their roles.',
        vote_eliminate: 'Vote to Eliminate',
        vote_cast: 'Vote Cast',
        confirm_action: 'Confirm Action',
        action_submitted: 'Action Submitted',
        revealed_info: 'Information',
        desc_werewolf: 'Team Werewolf. Wake up at night and see other wolves. Trick the village.',
        desc_villager: 'Team Village. No abilities at night. Find the wolves during the day.',
        desc_seer: 'Team Village. Check 1 player\'s card OR 2 center cards at night.',
        desc_robber: 'Team Village. Swap your card with another player and view your new role.',
        desc_troublemaker: 'Team Village. Swap cards between two other players without looking.',
        desc_minion: 'Team Werewolf. See the wolves but they don\'t see you. Win if wolves win.',
        desc_tanner: 'Neutral. You hate your life. Your goal is to get eliminated.',
        desc_drunk: 'Team Village. You are so drunk. Swap your card with a center card blindly.',
        desc_insomniac: 'Team Village. Wake up last to see if your role card has changed.',
        win_werewolf: 'WEREWOLF WINS',
        win_tanner: 'TANNER WINS',
        win_villager: 'VILLAGE WINS',
        village_safe: 'Village Saved',
        village_destroyed: 'Village Destroyed',
        help_wolves: 'Use this info to help the wolves win!',
        close_eyes: 'Close your eyes and wait for morning.',
        enter_village: 'ENTER THE VILLAGE...',
        game_not_found: 'Game not found.',
        waiting_players: 'Waiting for players to join...',
        host_configuring: 'The host is configuring the game...',
        reset_lobby: 'Reset Lobby',
        confirm_reset: 'Are you sure you want to reset the lobby?',
        needed: 'needed',
        too_many: 'too many',
        role_distribution: 'Role Distribution',
        seconds: 'Seconds',
        waiting_for: 'Waiting for:',
        click_to_flip: 'Click card to flip',
        tap_to_reveal: 'TAP TO REVEAL',
        continue: 'Continue',
        wake_check: 'Wake Up & Check Role',
        check_end_night: 'Check your role at the end of the night.',
        insomniac_role: 'Insomniac',
        center_cards: 'Center Cards',
        your_role: 'Your Role',
        player_menu: 'Player Menu',
        resume_game: 'Resume Game',
        exit_menu: 'Exit to Menu',
        found_wolf: 'Found Wolf',
        teammate: '(Teammate)',
        no_wolves: 'No wolves found.',
        inst_default: 'Choose a player.',
        inst_seer: 'View 1 Player OR 2 Center Cards.',
        inst_drunk: 'Choose a center card to swap with.',
        inst_insomniac: 'Wait to see your final role.'
    },
    ms: {
        app_title: 'Werewolf',
        join_btn: 'Masuk Game',
        admin_btn: 'Jadi Host',
        or: 'Atau',
        join_title: 'Moh Masuk Kampong',
        enter_name: 'Bubuh nama mung',
        display_name: 'Nama',
        lobby_title: 'LOBI',
        players: 'Orang Kampong',
        host: 'TOK PENGHULU',
        game_config: 'Setting Game',
        total_players: 'Jumloh Orang',
        assigned: 'Doh Set Role',
        start_game: 'MULA GAME',
        waiting_host: 'Tunggu Host Lok',
        admin_panel: 'Panel Admin',
        game_id: 'KOD BILIK',
        kick: 'Tebeng',
        next_phase: 'Fasa Depang',
        victory: 'MENANG',
        defeat: 'KALOH',
        back_home: 'Balik Asal',
        you_died: 'MUNG DOH MAMPUS',
        death_wolf: 'Kena bahang ke serigala doh malang tadi.',
        death_vote: 'Orang kampong pakat buang mung.',
        spectating: 'Mung jadi hantu doh lening.',
        waiting_for_others: 'Tunggu orang lain siap lok...',
        night_phase: 'Malang',
        day_phase: 'Siang',
        choose_victim: 'Pilih sapa nok bahang.',
        choose_reveal: 'Pilih member nok cek role dia.',
        choose_steal: 'Pilih member nok curi role dia.',
        choose_swap: 'Pilih DUA member nok tukar role.',
        vote_eliminate: 'Undi Buang',
        vote_cast: 'Doh Undi',
        confirm_action: 'Jadi Doh',
        action_submitted: 'Beres Boh',
        revealed_info: 'Pecoh Lubang',
        desc_werewolf: 'Geng Serigala. Bangun malang macang member lain. Nipiu orang kampong.',
        desc_villager: 'Orang Kampong. Dokdop power mende pun. Cari serigala siang nanti.',
        desc_seer: 'Geng Kampong. Boleh tengok 1 kad player ATAU 2 kad tengoh.',
        desc_robber: 'Geng Kampong. Tukar kad mung nge orang lain, pastu tengok kad baru.',
        desc_troublemaker: 'Geng Kampong. Tukar kad antara dua player lain. Diorang dok tahu mende.',
        desc_minion: 'Geng Serigala. Mung nampok serigala, tapi diorang dok nampok mung.',
        desc_tanner: 'Neutral. Mung fedup hidup. Menang kalu mung kena buang.',
        desc_drunk: 'Geng Kampong. Mabuk ketum. Tukar kad mung nge kad tengoh buta-buta.',
        desc_insomniac: 'Geng Kampong. Bangun last sekali cek kad sendiri kot-kot berubah.',
        win_werewolf: 'SERIGALA MENANG',
        win_tanner: 'TANNER MENANG',
        win_villager: 'KAMPONG MENANG',
        village_safe: 'Kampong Selamak',
        village_destroyed: 'Kampong Musnoh',
        help_wolves: 'Pakai info ni buak tolong serigala menang!',
        close_eyes: 'Pejang mata, tunggu siang.',
        enter_village: 'MASUK KAMPONG...',
        game_not_found: 'Game dok jumpo.',
        waiting_players: 'Tunggu orang masok...',
        host_configuring: 'Tok Penghulu duk setting game...',
        reset_lobby: 'Reset Lobi',
        confirm_reset: 'Mung confirm nok reset lobi?',
        needed: 'nok lagi',
        too_many: 'lebih doh',
        role_distribution: 'Pecoh Katu',
        seconds: 'Saat',
        waiting_for: 'Tunggu:',
        click_to_flip: 'Tekang kad tu',
        tap_to_reveal: 'TEKANG BUKA',
        continue: 'Jalang Terus',
        wake_check: 'Bangung Tengok Role',
        check_end_night: 'Tengok role mung masa abih malang.',
        insomniac_role: 'Insomniac',
        center_cards: 'Kad Tengoh',
        your_role: 'Role Mung',
        player_menu: 'Menu Player',
        resume_game: 'Sambung Maing',
        exit_menu: 'Keluor Menu',
        found_wolf: 'Jumpa Serigala',
        teammate: '(Geng Mung)',
        no_wolves: 'Takdok serigala.',
        inst_default: 'Pilih sorg player.',
        inst_seer: 'Tengok 1 Player ATAU 2 Kad Tengoh.',
        inst_drunk: 'Pilih kad tengoh nok tukor.',
        inst_insomniac: 'Tunggu nok tengok role.'
    }
};
